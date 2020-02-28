thomasvandoren.com
==================

The source for: [thomasvandoren.com](https://thomasvandoren.com/)

Development
-----------

Clone the site and pelican-themes:

```bash
git clone thomasvandoren/thomasvandoren.com
cd thomasvandoren.com
git clone https://github.com/getpelican/pelican-themes
```

Install python packages:

```bash
pipenv install
```

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
make clean s3_upload
```

License
-------
BSD
