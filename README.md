# serve-with-ease
Easily serve static directories.

`serve-with-ease` makes it possible serve an entire directory as a static site or serve multiple subdirectories as individual sites, using a reverse proxy to map domains or sub-paths to directories.

## Installation
You can choose one of the following options based on your usecase

### Serve a directory
```js
npx serve-with-ease path/to/dir
```

### Serve sub directories as distinct 

## Features
- [X] Web server to serve static content
- [X] Return correct mime type based on file extenstion
- [X] Route requests to specific directories based on header value
- [X] Route requests to specific directories based on domain name
- [X] Route requests to specific directories based on configuration
- [ ] List directories based on configurtion
- [X] Only serve from configured domain
- [ ] Return correct mime type based on magic header
- [X] Deployable with docker
