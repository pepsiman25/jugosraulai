async function runAI() {
  const jugo = document.getElementById("jugo").value;
  const enfermedad = document.getElementById("enfermedad").value;

  const response = await fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jugo, enfermedad })
  });

  const data = await response.json();

  document.getElementById("output").textContent =
    data.output_text || JSON.stringify(data, null, 2);

  const form = document.querySelector("form");
  const output = document.getElementById("output");
  const spinner = document.getElementById("spinner");

    form.addEventListener("submit", async (e) => {
    e.preventDefault();
  
  // Show spinner
  spinner.classList.remove("hidden");
  output.textContent = ""; // clear previous output

  const jugo = document.getElementById("jugo").value;
  const enfermedad = document.getElementById("context").value;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jugo, enfermedad })
    });

    const data = await response.json();
    output.textContent = data.output_text;

  } catch (error) {
    output.textContent = "Error generating response.";
  }

  // Hide spinner
  spinner.classList.add("hidden");
});
}
