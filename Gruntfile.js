module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        devel: true,
        node: true
      },
      all: ['libs/**/*.js']
    },
    nodeunit: {
      all: ['tests/**/*_test.js']
    },
    jsdoc: {
      src: ['libs/**/*.js'],
      options: {
        destination: 'docs'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.registerTask('default', ['jshint']);
};
