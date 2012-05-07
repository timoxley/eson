
var Parser = require('../')
  , include = Parser.include;

describe('include', function(){
  it('should parse the given file', function(){
    Parser()
      .use(include)
      .read('test/fixtures/include.json')
      .should.eql([
        "foo",
        {
          "view videos": "guest",
          "delete videos": "admin"
        },
        ["admin", "guest"]
      ]);
  })
  it('should parse files matching glob', function() {
    Parser()
      .use(include)
      .read('test/fixtures/include_glob.json')
      .should.eql({
        "app-config": { "db": "redis", "listen": 8000 },
        "user-config": { "permissions": { "view videos": "guest", "delete videos": "admin" }, "roles": ["admin", "guest"] },
        "users":  [ {"username": "Dave"}, {"username": "Tobi"} ]
      })
  })
  it('should parse files using preprocesor', function() {
    include.extensions.md = function(fileContent) {
      // pretend this is a markdown parser
      return JSON.stringify(fileContent.replace(/^\# +(.*)\n/, "<h1>$1</h1>"));
    }
    Parser()
      .use(include)
      .read('test/fixtures/include_preprocessor.json')
      .should.eql({
        "readme": "<h1>Hello World</h1>"
      })
  })
})
