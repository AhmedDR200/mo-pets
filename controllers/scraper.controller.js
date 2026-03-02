const asyncHandler = require("express-async-handler");
const { runFullScrape, getLastScrapeResult } = require("../services/scraper.service");

let scrapeInProgress = false;

exports.runScraper = asyncHandler(async (_req, res, _next) => {
  if (scrapeInProgress) {
    return res.status(409).json({
      status: "error",
      message: "A scrape is already in progress. Please wait for it to finish.",
    });
  }

  scrapeInProgress = true;
  try {
    const result = await runFullScrape();
    res.status(200).json({ status: "success", data: result });
  } finally {
    scrapeInProgress = false;
  }
});

exports.getScraperStatus = asyncHandler(async (_req, res, _next) => {
  const lastResult = getLastScrapeResult();

  if (!lastResult) {
    return res.status(200).json({
      status: "success",
      data: {
        message: "No scrape has been run yet.",
        inProgress: scrapeInProgress,
      },
    });
  }

  res.status(200).json({
    status: "success",
    data: { ...lastResult, inProgress: scrapeInProgress },
  });
});
