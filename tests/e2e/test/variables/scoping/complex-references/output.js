import { group } from "k6";
import http from "k6/http";

export default function () {
  let level13 = null;

  group("level 1.1", () => {
    let level12 = null;

    group("level 1.2", () => {
      group("level 1.3", () => {
        const response = http.get("https://example.com");

        level13 = response.body;
      });

      const response = http.get("https://example.com");

      level12 = response.body;
    });

    console.log(level12);
  });

  let level21 = null;

  group("level 2.1", () => {
    let level22 = null;

    group("level 2.2", () => {
      const response = http.get("https://example.com");

      level22 = response.body;
    });

    const response = http.get("https://example.com");

    level21 = response.body;

    console.log(level13);

    console.log(level22);
  });

  console.log(level21);
}
