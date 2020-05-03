# tvd.dev

The source for: [tvd.dev](https://tvd.dev)

Development
-----------

Clone the site and pelican-themes:

```bash
git clone thomasvandoren/tvd.dev
cd tvd.dev
git clone --recurse-submodules https://github.com/getpelican/pelican-themes
```

Patch the pelican theme to upgrade jquery.

```bash
( cd pelican-themes/ ; git apply ../jquery_upgrade.patch )
```

Install python packages:

```bash
pipenv install
```

Make sure you have wrangler installed:

```bash
npm i @cloudflare/wrangler -g
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
make clean wrangle
```

License
-------
BSD
