import fs from "fs";
import https from "https";

const url = "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/kjv.json";

function generate() {
  console.log("Downloading KJV Bible…");

  https.get(url, res => {
    let buf = "";
    res.on("data", chunk => buf += chunk);
    res.on("end", () => {
      try {
        const kjv = JSON.parse(buf);
        const books = {};

        kjv.forEach(v => {
          const b = v.book.replace(/\s+/g, "");
          if (!books[b]) books[b] = {};
          if (!books[b][v.chapter]) books[b][v.chapter] = {};
          books[b][v.chapter][v.verse] = v.text;
        });

        fs.mkdirSync("bible", { recursive: true });

        for (const b in books) {
          fs.writeFileSync(`bible/${b}.json`, JSON.stringify(books[b], null, 2));
        }

        console.log("✓ All 66 Bible books created automatically.");
      } catch (e) {
        console.error("Error:", e.message);
      }
    });
  });
}

// Auto-run when Codespaces starts
generate();
