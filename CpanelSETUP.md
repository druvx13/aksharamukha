# Deploying Aksharamukha on cPanel

This guide provides step-by-step instructions for deploying the Aksharamukha platform (frontend and backend) to a cPanel-based web hosting environment.

**Disclaimer:** cPanel interfaces and available features can vary slightly between hosting providers. The steps below outline a general approach. You may need to adapt some steps based on your specific cPanel version and configuration.

## Prerequisites

1.  **cPanel Access:** You need login credentials for your cPanel account.
2.  **Domain/Subdomain:** Decide where you want to host Aksharamukha (e.g., `aksharamukha.yourdomain.com` or `yourdomain.com/aksharamukha`). You might need to set this up in cPanel's "Domains" or "Subdomains" section.
3.  **SSH Access (Recommended):** While not strictly necessary for all steps, SSH access can simplify backend setup and troubleshooting. Check if your hosting provider offers this.
4.  **Python Support:** Your cPanel hosting should ideally support Python applications (often via "Setup Python App" or similar). If not, a more manual approach for running the backend will be needed.
5.  **Node.js Support (for building frontend on server):** If you plan to build the frontend directly on the server (not recommended for typical cPanel usage), you'd need Node.js. It's generally easier to build the frontend locally and upload the static files.

## Deployment Steps

The deployment involves two main parts:
1.  **Deploying the Frontend (Quasar/Vue.js static files)**
2.  **Deploying the Backend (Python/Flask API)**

---

### Part 1: Deploying the Frontend

The frontend is a Single Page Application (SPA) that needs to be built into static HTML, CSS, and JavaScript files. These static files are then uploaded to your server.

**Step 1.1: Build the Frontend Locally**

1.  **Navigate to the frontend directory on your local machine:**
    ```bash
    cd path/to/aksharamukha/aksharamukha-front
    ```
2.  **Install dependencies (if you haven't already):**
    ```bash
    npm install
    ```
3.  **Important: Configure the API URL for Production**
    *   Open `aksharamukha-front/src/mixins/ScriptMixin.js`.
    *   Locate the `baseURL` or similar variable that defines the backend API endpoint.
    *   Change this to the **actual URL where your backend API will be running** on your cPanel server (e.g., `https://api.yourdomain.com/api` or `https://yourdomain.com/api/aksharamukha-back/api` - you'll define this backend URL in Part 2).
    *   **Example (conceptual - actual variable name might differ):**
        ```javascript
        // Inside ScriptMixin.js
        // ...
        const instance = axios.create({
          // baseURL: 'http://localhost:8085/api' // Development
          baseURL: 'https://your_actual_backend_api_url/api' // Production
        })
        // ...
        ```
    *   **Note on `quasar.conf.js` for production:**
        *   Ensure `devServer > https` is `false` or commented out unless you have a specific need and setup for HTTPS in local dev pointing to production.
        *   The `build > vueRouterMode` is likely already `history`. If it's `hash`, URLs will have `/#/`. `history` mode is cleaner but requires server-side configuration (see Step 1.4).

4.  **Build for production:**
    ```bash
    npx quasar build
    ```
    This command will generate a `dist/spa` (or similar, like `dist/pwa` or `dist/ssr` depending on your Quasar mode, typically `dist/spa` for a standard SPA build) folder within `aksharamukha-front/`. This folder contains all the static files needed for the frontend.

**Step 1.2: Upload Frontend Files to cPanel**

1.  **Access cPanel File Manager:** Log in to your cPanel and open the "File Manager".
2.  **Navigate to your chosen web root:**
    *   If using a primary domain: `public_html`
    *   If using an addon domain or subdomain: The document root specified when you set up the domain (e.g., `public_html/yourdomain.com` or `yoursubdomain.yourdomain.com`).
3.  **Upload the built frontend:**
    *   Go into the `aksharamukha-front/dist/spa/` folder on your local machine.
    *   Select all files and folders within `dist/spa/`.
    *   Compress them into a ZIP file (e.g., `frontend-build.zip`).
    *   In cPanel File Manager, use the "Upload" button to upload this ZIP file to your web root.
    *   Once uploaded, select the ZIP file in File Manager and click "Extract".

**Step 1.3: Configure for Vue Router `history` mode (if applicable)**

If your Quasar app uses `history` mode for Vue Router (common for cleaner URLs), you need to configure the server to redirect all requests to `index.html`. This allows the client-side router to handle different paths.

1.  In cPanel File Manager, navigate to the directory where you uploaded the frontend files.
2.  Create or edit the `.htaccess` file in this directory.
3.  Add the following rules:
    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteBase /
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteRule . /index.html [L]
    </IfModule>
    ```
    *   If you installed the frontend in a subdirectory (e.g., `public_html/akshara/`), you might need to adjust `RewriteBase` (e.g., `RewriteBase /akshara/`) and the final `RewriteRule` (e.g., `RewriteRule . /akshara/index.html [L]`).

**Step 1.4: Test the Frontend**
Open your domain/subdomain in a browser. You should see the Aksharamukha frontend. It won't be functional yet as the backend isn't set up.

---

### Part 2: Deploying the Backend (Python/Flask API)

This is often the more complex part on cPanel.

**Method A: Using cPanel's "Setup Python App" Feature (Recommended if available)**

1.  **Upload Backend Files:**
    *   Create a directory for your backend outside of `public_html` for security (e.g., `/home/your_cpanel_user/aksharamukha_backend`).
    *   Go into the `aksharamukha-back/` directory on your local machine.
    *   Select all files and folders (including `main.py`, `requirements.txt`, the `resources/` directory, `aksharamukha/` library directory, etc.).
    *   Compress them into a ZIP file (e.g., `backend-app.zip`).
    *   In cPanel File Manager, navigate to the directory you created (e.g., `aksharamukha_backend`) and upload `backend-app.zip`.
    *   Extract the ZIP file.

2.  **Set up the Python Application in cPanel:**
    *   In cPanel, find and open "Setup Python App" (or similar like "Python Selector").
    *   Click "Create Application".
    *   **Python version:** Select a Python 3.x version (e.g., 3.7, 3.8, 3.9, or newer if available and compatible with `requirements.txt`).
    *   **Application root:** Set this to the directory where you extracted the backend files (e.g., `/home/your_cpanel_user/aksharamukha_backend`).
    *   **Application URL:** This is crucial. Choose the URL where the API will be accessible. This is the URL you configured in the frontend (Step 1.1.3).
        *   Example: If your frontend is at `aksharamukha.yourdomain.com` and you want the API at `aksharamukha.yourdomain.com/api`, then select your domain and type `api` in the box.
        *   If you want it at `api.yourdomain.com`, you would need to set up `api.yourdomain.com` as a separate subdomain pointing to this Python app.
    *   **Application startup file:** Enter `main.py` (or `passenger_wsgi.py` if that's how your host structures it - see below).
    *   **Application Entry point:** This should be the Flask app instance. In `main.py`, it's `app`. So, you'd enter `app`.
    *   **Passenger log file:** Can be left as default or set to a specific path.

3.  **Install Dependencies:**
    *   Once the app is created, there should be a section to manage it.
    *   Look for a way to specify the `requirements.txt` file. Typically, you'd enter `requirements.txt` in a field and click an "Install" or "Run pip install" button.
    *   Alternatively, you might need to open a terminal provided by the "Setup Python App" interface (or via SSH) and run:
        ```bash
        # Ensure you are in the virtual environment of the Python app
        pip install -r requirements.txt
        ```

4.  **WSGI File (if `main.py` isn't directly used as startup):**
    *   Some cPanel Python setups use a `passenger_wsgi.py` file. If `main.py` isn't run directly, you'll need to create/edit `passenger_wsgi.py` in your application root:
        ```python
        import os
        import sys

        # Add project directory to sys.path
        sys.path.insert(0, os.path.dirname(__file__))

        # Import the Flask app instance from your main.py
        from main import app as application

        # For some setups, you might also need:
        # INTERP = "/home/your_cpanel_user/opt/python/3.8/bin/python" # Adjust to your Python path
        # if sys.executable != INTERP: os.execl(INTERP, INTERP, *sys.argv)
        ```
    *   If using `passenger_wsgi.py`, set this as the "Application startup file" in cPanel, and the "Application Entry point" would be `application`.

5.  **Restart and Test the Backend:**
    *   After configuration and installing dependencies, restart the Python application from the cPanel interface.
    *   Try accessing one of your backend API endpoints directly in your browser or using a tool like Postman (e.g., `https://your_actual_backend_api_url/api/convert` - though this might expect a POST request). A simple GET endpoint, if available, would be easier to test initially. Check `aksharamukha-back/main.py` for any simple GET routes for testing.
    *   Check any log files specified in the Python App setup for errors.

**Method B: Manual Flask Setup (If "Setup Python App" is unavailable or problematic)**

This method is more advanced and relies on you being able to run Python processes and potentially configure reverse proxies (if your host allows `.htaccess` proxies or you have Nginx/Apache config access, which is rare on shared cPanel).

1.  **Upload Backend Files:** Same as Step 2.A.1.
2.  **Create a Virtual Environment (via SSH):**
    *   SSH into your server.
    *   Navigate to your backend directory (e.g., `cd ~/aksharamukha_backend`).
    *   `python3 -m venv venv`
    *   `source venv/bin/activate`
    *   `pip install -r requirements.txt`
3.  **Run Flask Manually (e.g., with Gunicorn):**
    *   Install Gunicorn: `pip install gunicorn`
    *   You would run Gunicorn like this (via SSH, often in a `screen` or `tmux` session to keep it running after you log out):
        ```bash
        gunicorn --workers 3 --bind 127.0.0.1:XXXX main:app
        ```
        (Replace `XXXX` with an unused port, e.g., 8085, 8001).
    *   **Problem:** Standard cPanel setups might kill long-running processes. You might need a process manager like `supervisor`, but installing and configuring it on shared cPanel is usually not possible. Some hosts offer "Application Manager" which might allow running custom commands.

4.  **Expose the Backend:**
    *   This is the trickiest part. You need to make the Gunicorn process (running on `127.0.0.1:XXXX`) accessible via a public URL.
    *   **Using `.htaccess` (if `mod_proxy` is enabled by your host):**
        Create/edit `.htaccess` in the `public_html` directory (or subdomain's document root) that corresponds to your desired API URL.
        ```apache
        RewriteEngine On
        RewriteRule ^api/(.*)$ http://127.0.0.1:XXXX/$1 [P,L]
        ```
        This attempts to proxy requests from `yourdomain.com/api/...` to the Gunicorn process. Many shared hosts disable `mod_proxy` or the `P` flag for security.
    *   **Cloudflare Argo Tunnel or similar:** If you use Cloudflare, you could potentially use an Argo Tunnel to expose the local port, but this adds complexity.

**Method B is generally not recommended for typical shared cPanel due to process management and proxying limitations.**

---

### Part 3: Final Testing

1.  Navigate to your frontend URL in the browser.
2.  Test the transliteration features. Check the browser's developer console (Network tab) to see if API requests to your backend URL are successful (Status 200 OK) or if they are failing (404, 500, CORS errors).
3.  **CORS Errors:** If you get CORS errors, ensure your Flask backend (in `main.py`) has `flask_cors` configured correctly. The existing `CORS(app)` in `main.py` should handle this for most cases, but ensure the frontend URL is correctly permitted if any specific origins are set.

---

## Troubleshooting Common cPanel Issues

*   **500 Internal Server Error (Backend):**
    *   Check the Python app logs in cPanel ("Setup Python App" > Your App > Logs).
    *   Ensure all dependencies in `requirements.txt` were installed correctly in the app's virtual environment.
    *   Verify file permissions. Python scripts often need to be executable.
    *   Ensure the `resources` directory and its JSON files were uploaded correctly and are accessible by the Python script. Path issues are common. The backend code reads these files, so paths must be correct relative to `main.py`.
*   **404 Not Found (Frontend or Backend):**
    *   **Frontend:** Double-check `.htaccess` rules if using history mode. Ensure all files from `dist/spa` were uploaded to the correct web root.
    *   **Backend:** Verify the "Application URL" in "Setup Python App" matches what the frontend is calling. Ensure the Python app is running.
*   **Frontend Loads but Functionality Fails:**
    *   Open browser developer tools (Console and Network tabs).
    *   Check for JavaScript errors in the console.
    *   In the Network tab, inspect API calls to the backend. Are they going to the right URL? What is the response status and content? This often points to backend issues or incorrect API URL in frontend config.
*   **Python App Not Starting:**
    *   Syntax errors in `main.py` or `passenger_wsgi.py`.
    *   Incorrect "Application startup file" or "Application Entry point".
    *   Missing dependencies.
*   **Resource Files Not Found by Backend:**
    *   The backend `main.py` loads JSON files from its `resources` subfolder. Ensure paths in the Python code correctly locate these files relative to where `main.py` is running from in the cPanel environment. The current code uses relative paths like `open('resources/syllabary/syllabary_Ahom.json', ...)`. This should generally work if the `resources` folder is in the same directory as `main.py`.

## Important Considerations for Aksharamukha Backend

*   **Resource Files:** The `aksharamukha-back/resources/` directory is very large and contains many small JSON files. Ensure the upload and extraction process completes fully without errors and that all files are present on the server.
*   **Performance:** Shared cPanel hosting might have resource limitations (CPU, memory). A complex application like Aksharamukha might be slow if the hosting plan is very basic.
*   **File Permissions:** Ensure your Python scripts and the directories they need to write to (if any, though Aksharamukha is mostly read-heavy for resources) have appropriate permissions. Typically, directories are `755` and files are `644`.

This guide provides a comprehensive starting point. Due to the variability of cPanel configurations, some adaptation and troubleshooting specific to your hosting environment may be necessary. Good luck!
