# Aksharamukha: Unified Script Transliteration Platform

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

**Live Application:** [aksharamukha.appspot.com](http://aksharamukha.appspot.com/)

## Overview

Aksharamukha is a comprehensive platform for script conversion (transliteration) primarily focused on scripts within the Indic cultural sphere. It goes beyond simple character mapping by implementing various script and language-specific orthographic conventions, such as vowel lengths, gemination, and nasalization. The platform offers extensive customization options to fine-tune orthography according to user needs.

This repository contains the source code for the Aksharamukha web application, including its frontend, backend API, and related tools.

**Key Features:**

*   **Extensive Script Support:** As of its latest version, Aksharamukha supports transliteration among 120 scripts, including historical and modern Indic scripts, Semitic scripts, and various Romanization schemes.
*   **Romanization Standards:** Supports numerous Indic Romanization formats like Harvard-Kyoto, ITRANS, Velthuis, IAST, ISO, Titus, SLP1, WX, and more. It also supports Semitic Romanization formats like ISO 259 Hebrew, SBL Hebrew, ISO 233 Arabic, and DMG Persian.
*   **Orthographic Accuracy:** Attempts to apply known orthographic rules for different scripts and languages.
*   **Customization:** Provides options to tailor the transliteration output.
*   **Multiple Interfaces:**
    *   Web Application (this repository)
    *   [Python Package](https://pypi.org/project/aksharamukha/) (maintained in a [separate repository](https://github.com/virtualvinodh/aksharamukha-python))
    *   [REST API](http://aksharamukha.appspot.com/#/web-api)
    *   [Chrome Extension](https://chrome.google.com/webstore/detail/aksharamukha-script-conve/nahdihjmpjlifenlocchbokbnpoifpho?hl=en) (source code in a [separate repository](https://github.com/virtualvinodh/aksharamukha-extension))

### Supported Scripts (Partial List)

Ahom, Arabic, Ariyaka, Assamese, Avestan, Balinese, Batak Karo, Bengali, Brahmi, Burmese, Chakma, Cham, Cyrillic (Russian), Devanagari, Dogra, Grantha, Gujarati, Hebrew, Japanese (Hiragana & Katakana), Javanese, Kannada, Khmer, Lao, Malayalam, Modi, Oriya, Punjabi (Gurmukhi), Sinhala, Tamil, Telugu, Thai, Tibetan, Urdu, and many more.

## Repository Structure

This repository is organized into several key components:

*   **`aksharamukha-front/`**: The frontend web application built with Quasar (Vue.js). This is what users interact with in their browsers.
*   **`aksharamukha-back/`**: The backend API server built with Python (Flask). It handles the transliteration logic, serves script data, and exposes API endpoints.
    *   **`aksharamukha-back/resources/`**: Contains crucial JSON data files for script mappings, syllabaries, conjunct rules, etc.
*   **`aksharamukha-offline/`**: Provides Docker configurations and scripts to run the entire Aksharamukha platform locally in an offline environment.
*   **`aksharamukha-web-plugin/`**: Contains JavaScript code for a legacy web plugin. (Note: For the modern Chrome extension, see the separate repository linked above).
*   **`aksharamukha-web-plugin-api/`**: A small supporting API for the legacy web plugin, deployable on Google App Engine.
*   **`build-scripts/`**: Contains various helper scripts for building and packaging parts of the application (e.g., for Docker, Cordova, App Engine).
*   **`docker-compose.yaml`**: Docker Compose file at the root to orchestrate the local deployment of frontend, backend, and a font-serving container.
*   **`README.md`**: This file.
*   **`CpanelSETUP.md`**: Detailed instructions for deploying Aksharamukha on a cPanel-based hosting environment.
*   **`gpl-3.0.txt`**: The GNU Affero General Public License v3.0 under which this project is released.

## Getting Started / Local Development

The easiest way to run the full Aksharamukha platform locally is using Docker.

### Prerequisites

*   [Docker Desktop](https://docs.docker.com/get-docker/) installed on your system.
*   [Node.js](https://nodejs.org/) (LTS version, e.g., v14 or later, as per Quasar compatibility) for frontend development if not using Docker for the frontend.
*   [Python 3](https://www.python.org/downloads/) for backend development if not using Docker for the backend.

### 1. Using Docker (Recommended)

This method runs the frontend, backend, and a font-serving container.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/virtualvinodh/aksharamukha.git
    cd aksharamukha
    ```
2.  **Start the services using Docker Compose:**
    ```bash
    docker compose up
    ```
    This command will download the pre-built images (or build them if not available) and start all necessary containers.
3.  **Access the application:**
    *   Frontend: Open your browser and navigate to `http://localhost:12345`
    *   Backend API: Will be accessible at `http://localhost:8085` (the frontend is configured to use this).
    *   Fonts service: Will be running on `http://localhost:9899`.

### 2. Manual Setup (Frontend & Backend Separately)

If you prefer to run the frontend and backend manually for development:

#### Backend (`aksharamukha-back/`)

1.  **Navigate to the backend directory:**
    ```bash
    cd aksharamukha-back
    ```
2.  **Create a virtual environment (recommended):**
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Run the Flask development server:**
    ```bash
    python3 main.py
    ```
    The backend API will be running on `http://127.0.0.1:8085`.

#### Frontend (`aksharamukha-front/`)

1.  **Navigate to the frontend directory:**
    ```bash
    cd aksharamukha-front
    ```
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```
3.  **Important Build Adjustments (as per original README):**
    *   Comment out line 9 (`'analytics'`) in `quasar.conf.js` if you don't have analytics set up, to prevent build failures.
        ```javascript
        // In quasar.conf.js
        plugins: [
          'i18n',
          'axios',
          // 'analytics' // <-- Comment this out
        ],
        ```
    *   In `src/pages/index.vue`, comment out the `import keys from '../keys.js'` line. Below it, add an empty API key for Google's OCR API if you are not using that service, to allow the project to build:
        ```javascript
        // In src/pages/index.vue
        // import keys from '../keys.js' // <-- Comment this out
        // sets empty API key for Google's OCR API to build the project without using that service
        var keys = {}
        keys['api_key'] = ''
        ```
    *   Ensure the API endpoint in the frontend points to your local backend. This is typically managed in `src/mixins/ScriptMixin.js`. By default, it might be configured for the production URL or `localhost:8085`. For local development, `localhost:8085` (or the port your backend is running on) is usually correct.

4.  **Start the Quasar development server:**
    ```bash
    npx quasar dev
    ```
    The frontend will be accessible at the URL provided in the output (usually `http://localhost:8080`).

## Deployment

### Google App Engine

The backend (`aksharamukha-back/app.yaml`) and the legacy web plugin API (`aksharamukha-web-plugin-api/app.yaml`) are configured for deployment on Google App Engine.

### cPanel

For deploying Aksharamukha on a cPanel-based hosting environment, please refer to the detailed instructions in **[CpanelSETUP.md](CpanelSETUP.md)**.

## JSON Resources

The Aksharamukha backend relies on a rich set of JSON files for its transliteration logic. These are located in `aksharamukha-back/resources/`:

*   **Script Mapping (`script_mapping/`):** Overall character mappings.
*   **Script Matrix (`script_matrix/`):** Data for displaying character matrices.
*   **Syllabary (`syllabary/`):** Lists of vowels, consonants, and consonant-vowel compounds for each script.
*   **Conjuncts (`conjuncts1/`, `conjuncts2/`):** Possible Sanskrit (and Pali) conjuncts for various scripts.

These resources are essential for the accurate functioning of the transliteration engine.

## Contributing

Contributions to Aksharamukha are welcome. Please consider the following:

*   **Reporting Issues:** If you find a bug or have a feature request, please open an issue on the GitHub repository.
*   **Code Contributions:**
    1.  Fork the repository.
    2.  Create a new branch for your feature or bug fix.
    3.  Make your changes.
    4.  Ensure your code adheres to existing coding styles.
    5.  Write tests for your changes if applicable.
    6.  Submit a pull request.

## License

Aksharamukha is released under the **GNU Affero General Public License v3.0**. See the [gpl-3.0.txt](gpl-3.0.txt) file for details. This means if you run a modified version of this software as a network service, you must also offer the source code of that modified version to its users.

## Acknowledgements

Aksharamukha is a project by Vinodh Rajan. It builds upon extensive research into the orthographies and structures of numerous scripts.
---

This README provides a comprehensive overview. For specific deployment scenarios or development tasks, refer to the relevant sub-directories and their configurations.