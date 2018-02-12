blog.thomasvandoren.com
=======================

The source for: [blog.thomasvandoren.com](http://blog.thomasvandoren.com/)

Development
-----------

Clone the site and pelican-themes:

```bash
git clone git@github.com:thomasvandoren/blog.thomasvandoren.com.git
git clone https://github.com/getpelican/pelican-themes
cd blog.thomasvandoren.com
```

Install python packages:

```bash
pip install -r requirements.txt
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
