import http from "k6/http";

export default function () {
  const body = JSON.stringify({});

  const response = http.put("http://localhost:8080/echo", body, {
    headers: { "Content-Type": "application/json" },
  });

  const myVar = response.body;
}
