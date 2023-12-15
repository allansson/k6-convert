import http from "k6/http";

export default function () {
  const body = "Hey, this is not JSON!";

  http.post("http://localhost:8080/echo", body, {
    headers: { "Content-Type": "application/json" },
  });
}
