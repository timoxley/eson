
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
        "users":  [ {"username": "Dave"}, {"username": "Tobi"} ],
        "invalid-glob": "",
        "invalid-map": {},
        "invalid-array": []
      })
  })
  it('should parse files using preprocesor', function() {
    include.extensions.md = function(fileContent) {
      // pretend this is a markdown parser
      return JSON.stringify(fileContent.toUpperCase())
    }
    Parser()
      .use(include)
      .read('test/fixtures/include_preprocessor.json')
      .should.eql({
        "readme": "# READ ME\n\nOMG\n"
      })
  })
})
