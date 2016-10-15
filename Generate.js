const fs = require('fs')
const _ = require('lodash')
const path = require('path')

function t(s,d){
 for(let p in d)
   s=s.replace(new RegExp('---'+p+'---','g'), d[p]);
 return s;
}

class Generate {
  constructor (options) {
    this.file = 'demo.txt'
    this.target = options.target
    this.name = options.name
  }
  data () {
    return {
      uppercaseName: this.name.toUpperCase(),
      lowercaseName: this.name,
      capitalizeName: this.name.substr(0,1).toUpperCase() + this.name.substr(1)
    }
  }
  getFileContents (file) {
    return fs.readFileSync(file, {encoding:'utf8'})
  }
  getStructure (root) {
    return new Promise(function(resolve, reject){
      const structure = {}
      function walkSync(currentDirPath) {
          fs.readdirSync(currentDirPath).forEach(function (name) {
              var filePath = path.join(currentDirPath, name);
              var stat = fs.statSync(filePath);
              if (stat.isFile()) {
                  structure[filePath] = {type:'file', path:filePath}
              } else if (stat.isDirectory()) {
                  structure[filePath] = {type:'directory', path:filePath}
                  walkSync(filePath);
              }
          });
      }
      walkSync(root)
      resolve(structure)
    })
  }
  build () {
    const root = 'template'
    this.getStructure(root).then(structure => {
      _.each(structure, item => {
        if (item.type == 'directory') {
          fs.mkdirSync(item.path.substr(root.length + 1))
        } else if (item.type == 'file') {
          const fullPath = t(item.path.substr(root.length + 1), this.data())
          const contents = this.getFileContents(item.path)
          fs.writeFileSync(fullPath, _.template(contents)(this.data()))
        }
      })
    }).catch(err=>{
      console.log(err)
    })
  }
}

module.exports = Generate
