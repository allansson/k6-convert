import http from "k6/http";

export default function () {
  const body = JSON.stringify({ hello: "world", foo: false });

  http.post("http://localhost:8080/echo", body, {
    headers: { "Content-Type": "application/json" },
  });
}
