import fs from "fs";
import https from "https";

// Clean, stable KJV JSON source
const url = "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/kjv.json";

// Canonical 66-book order
const bookOrder = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
  "Joshua","Judges","Ruth","1Samuel","2Samuel","1Kings","2Kings",
  "1Chronicles","2Chronicles","Ezra","Nehemiah","Esther","Job","Psalms",
  "Proverbs","Ecclesiastes","SongofSolomon","Isaiah","Jeremiah","Lamentations",
  "Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum",
  "Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts","Romans","1Corinthians","2Corinthians",
  "Galatians","Ephesians","Philippians","Colossians","1Thessalonians",
  "2Thessalonians","1Timothy","2Timothy","Titus","Philemon","Hebrews","James",
  "1Peter","2Peter","1John","2John","3John","Jude","Revelation"
];

function generate() {
  console.log("Downloading KJV Bible…");

  https.get(url, res => {
    let buf = "";
    res.on("data", chunk => buf += chunk);
    res.on("end", () => {
      try {
        const kjv = JSON.parse(buf);

        const books = {};
        const chapterIndex = {};
        const verseIndex = {};
        const searchIndex = {};

        const stopWords = new Set([
          "the","and","a","an","of","to","in","that","is","it","for",
          "with","as","on","be","he","she","they","them","his","her",
          "but","or","by","from","this","these","those","are","was","were"
        ]);

        kjv.forEach(v => {
          const book = v.book.replace(/\s+/g, "");
          const chapter = v.chapter;
          const verseNum = v.verse;
          const text = v.text;

          // Build nested book structure
          if (!books[book]) books[book] = {};
          if (!books[book][chapter]) books[book][chapter] = {};
          books[book][chapter][verseNum] = text;

          // Build chapter index
          if (!chapterIndex[book]) chapterIndex[book] = 0;
          if (chapter > chapterIndex[book]) chapterIndex[book] = chapter;

          // Build verseIndex
          const ref = `${v.book} ${chapter}:${verseNum}`;
          verseIndex[ref] = text;

          // Build search index
          const clean = text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .split(/\s+/);

          clean.forEach(word => {
            if (!word || stopWords.has(word)) return;
            if (!searchIndex[word]) searchIndex[word] = [];
            searchIndex[word].push(ref);
          });
        });

        // Make folder
        fs.mkdirSync("bible", { recursive: true });

        // Save 66 books
        for (const b in books) {
          fs.writeFileSync(`bible/${b}.json`, JSON.stringify(books[b], null, 2));
        }

        // Save index files
        fs.writeFileSync("bible/chapterIndex.json", JSON.stringify(chapterIndex, null, 2));
        fs.writeFileSync("bible/verseIndex.json", JSON.stringify(verseIndex, null, 2));
        fs.writeFileSync("bible/bookOrder.json", JSON.stringify(bookOrder, null, 2));
        fs.writeFileSync("bible/searchIndex.json", JSON.stringify(searchIndex, null, 2));

        console.log("✓ All 66 Bible books created.");
        console.log("✓ chapterIndex.json created.");
        console.log("✓ verseIndex.json created.");
        console.log("✓ bookOrder.json created.");
        console.log("✓ searchIndex.json created.");

      } catch (e) {
        console.error("Error:", e.message);
      }
    });
  });
}

// Auto-run when Codespaces starts
generate();
