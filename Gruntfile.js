module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        devel: true,
        node: true
      },
      all: ['*.js']
    },
    mochaTest: {
      all: ['tests/**/*_test.js']
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('test', ['mochaTest']);
};
