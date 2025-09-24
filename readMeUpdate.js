const fs = require("fs");
const dayjs = require("dayjs");
const Parser = require("rss-parser");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

const parser = new Parser({
  headers: {
    Accept: "application/rss+xml, application/xml, text/xml; q=0.1",
  },
});

(async () => {
  try {
    // 기존 README.md 내용 읽기
    const existingContent = fs.readFileSync("README.md", "utf8");

    // Recent Posts 섹션이 이미 있는지 확인하고 제거
    const recentPostsIndex = existingContent.indexOf("### Recent Posts");
    let baseContent = existingContent;

    if (recentPostsIndex !== -1) {
      // 기존 Recent Posts 섹션이 있으면 그 부분을 제거
      baseContent = existingContent.substring(0, recentPostsIndex).trim();
    }

    // Recent Posts 섹션 생성
    let recentPostsText = `\n\n### Recent Posts\n`;

    // 피드 목록
    const feed = await parser.parseURL("https://yeomyeom.tistory.com/rss");

    // 최신 5개의 글의 제목과 링크를 가져온 후 text에 추가
    for (let i = 0; i < 5; i++) {
      const { title, link, pubDate } = feed.items[i];
      console.log(`${i + 1}번째 게시물`);
      console.log(`추가될 제목: ${title}`);
      console.log(`추가될 링크: ${link}`);

      const date = dayjs(pubDate).add(9, "hours").format("YYYY.MM.DD");
      recentPostsText += `- <a href=${link}>${title}</a>\n`;
      recentPostsText += `<sub>createdAt : ${date}</sub></br>\n`;
    }

    // 기존 내용 + Recent Posts 합치기
    const finalContent = baseContent + recentPostsText;

    // README.md 파일 작성
    fs.writeFileSync("README.md", finalContent, "utf8");

    console.log("업데이트 완료");
  } catch (error) {
    console.error("에러 발생:", error);
  }
})();
