import { group } from "k6";
import http from "k6/http";

export default function () {
  let innerVar = null;

  group("inner", () => {
    const response = http.get("https://example.com");

    innerVar = response.body;
  });

  console.log(innerVar);
}
