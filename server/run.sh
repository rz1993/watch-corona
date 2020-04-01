#!/bin/sh

# Time Series (Confirmed/Deaths/Recovered): https://github.com/CSSEGISandData/COVID-19
# Time Series (CDC Tests): https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/testing-in-us.html

git clone https://github.com/CSSEGISandData/COVID-19

flask database create
flask database fill
gunicorn app:app
