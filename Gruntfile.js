module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        devel: true,
        node: true,
        expr: true
      },
      all: ['libs/**/*.js', 'tests/**/*.js']
    },
    nodeunit: {
      all: ['tests/**/*_test.js'],
      options: {
          reporter: 'grunt'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.registerTask('default', ['jshint', 'nodeunit']);
};
