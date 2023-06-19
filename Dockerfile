FROM mcr.microsoft.com/playwright:focal as BASE

WORKDIR /usr/src/app
COPY package*.json ./
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = 1 
RUN npm install

COPY . .


# RUN PLAYWRIGHT_BROWSERS_PATH=/usr/lib/playwright npm install playwright-chromium@1.35.0
# RUN npm install playwright-chromium@1.35.0

# RUN PLAYWRIGHT_BROWSERS_PATH=/usr/lib/playwright node app


EXPOSE 8080
# CMD [ "PLAYWRIGHT_BROWSERS_PATH=/usr/lib/playwright", "node", "app.js" ]
CMD [  "node", "app.js" ]

