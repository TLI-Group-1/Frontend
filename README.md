# Frontend

AutoDirect web-based user interface.
Hosted with GitHub Pages: https://autodirect.tech/

## Starting a local web server with Python
Serving the frontend via an HTTP server allows for API queries to be sent without raising CORS issues in the browser. 

One way to serve the frontend locally is to use Python3's built-in `http.server` module.
```bash
sudo python3 -m http.server 80 --bind 0.0.0.0
```
Note that the Python HTTP server is not suited for production use and should only be used for local testing purposes.
