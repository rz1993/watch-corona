#!/bin/sh

# Time Series (Confirmed/Deaths/Recovered): https://github.com/CSSEGISandData/COVID-19
# Time Series (CDC Tests): https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/testing-in-us.html

echo "Downloading data"
mkdir data
pushd data
git clone https://github.com/CSSEGISandData/COVID-19
popd

echo "Finished downloading data. Creating tables."
flask database create

echo "Finished creating tables. Backfilling table."
flask database fill ./data
