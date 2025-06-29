# LlamaTalks

LlamaTalks is a modern web application designed to facilitate seamless conversations with powerful language models, leveraging the Ollama platform for local model execution. Whether you're exploring AI capabilities or building conversational tools, LlamaTalks provides a user-friendly interface and robust backend to get you started quickly.

---

## Why LlamaTalks?

The inspiration for LlamaTalks came from the need to easily interact with large language models (LLMs) on your own hardware, without relying on third-party APIs or cloud services. By utilizing the [Ollama](https://ollama.com/) platform, LlamaTalks allows you to run, experiment, and converse with LLMs locally, ensuring privacy, speed, and flexibility.

---

## Features

- **Local LLM Inference:** Run models directly on your machine using Ollama.
- **Clean, Intuitive UI:** Simple interface for chatting and exploring model capabilities.
- **Easy Setup:** Minimal configuration required to get started.
- **Extensible:** Built with modern frameworks for easy customization and extension.

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/utdevnp/LlamaTalks.git
cd LlamaTalks
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

---

## Setting Up Ollama

LlamaTalks relies on the Ollama platform to run language models locally. Follow these steps to set up Ollama:

### 1. Install Ollama

Visit the [Ollama download page](https://ollama.com/download) and download the installer for your operating system (macOS, Windows, or Linux).  
Follow the installation instructions provided on the website.

### 2. Start Ollama

After installation, start the Ollama service:

```bash
ollama serve
```

This will run Ollama in the background, making it accessible to LlamaTalks.

### 3. Pull a Model

For example, to pull the Llama 2 model:

```bash
ollama pull llama2
```

You can explore and pull other models as needed.

---

## Usage

1. Ensure Ollama is running and your desired model is pulled.
2. Start the LlamaTalks application:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.
4. Begin chatting with your local LLM!

---

## Contribution

We welcome contributions to improve LlamaTalks! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Submit a pull request with a clear description of your changes.

Please ensure your code follows the project's style and includes tests if applicable.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
