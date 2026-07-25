FROM node:lts-slim
WORKDIR /usr/src/app
RUN chown node:node /usr/src/app
USER node
COPY --chown=node:node ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm ci --silent
COPY --chown=node:node . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "exec", "vite", "--", "preview", "--host", "0.0.0.0", "--port", "3000"]
