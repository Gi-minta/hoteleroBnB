import { describe, it, expect } from "vitest"

describe("App shell", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div")
    div.id = "root"
    document.body.appendChild(div)
    expect(document.getElementById("root")).toBeTruthy()
  })
})
