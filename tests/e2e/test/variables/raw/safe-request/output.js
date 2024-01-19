import http from "k6/http";

export default function () {
  const response = http.get("http://localhost:8080/echo");

  const myVar = response.body;
}
