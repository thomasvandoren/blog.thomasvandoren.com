blog.thomasvandoren.com
=======================

The source for: [blog.thomasvandoren.com](http://blog.thomasvandoren.com/)

Development
-----------

When developing the site:

```bash
# Generate the HTML
make html

# Serve the HTML at localhost:8000
make serve

# Serve the HTML at localhost:9000
make serve PORT=9000
```

Publishing the site:

```bash
# Generate the "production" HTML
make publish

# Deploy the site
make ssh_upload SSH_USER=<username> SSH_TARGET_DIR='~/path/to/target'
```

License
-------
BSD
