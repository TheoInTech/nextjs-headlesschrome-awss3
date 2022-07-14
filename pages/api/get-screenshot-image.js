/* eslint-disable import/no-anonymous-default-export */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer";
import AWS from "aws-sdk";

const S3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
});

async function getBrowserInstance() {
  const executablePath = await chromium.executablePath;

  if (!executablePath) {
    // running locally
    return puppeteer.launch({
      args: chromium.args,
      headless: true,
      defaultViewport: {
        height: 720,
        width: 1280,
      },
      ignoreHTTPSErrors: true,
    });
  }

  return await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
    defaultViewport: {
      height: 720,
      width: 1280,
    },
    ignoreHTTPSErrors: true,
  });
}

export default async (req, res) => {
  const url = req.body.url;

  if (!url || !url.trim()) {
    res.json({
      status: "error",
      error: "Enter a valid URL",
    });
  }

  let result = null;
  let browser = null;

  try {
    browser = await getBrowserInstance();

    let page = await browser.newPage();
    const fileName = "img_" + Date.now() + ".jpg";

    await page.goto(url);

    const title = await page.title();
    const imageBuffer = await page.screenshot();

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: imageBuffer,
    };

    S3.upload(params, (error, data) => {
      if (error) {
        console.error(error, data);
        return res.json({
          status: "error",
          error: error.message || "Something went wrong!",
        });
      }

      const paramsSignedURL = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Expires: 60,
      };

      const signedURL = S3.getSignedUrl("getObject", paramsSignedURL);

      res.json({
        status: "ok",
        data: signedURL,
      });
    });
  } catch (error) {
    console.log(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
