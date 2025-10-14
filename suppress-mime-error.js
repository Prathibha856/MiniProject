// Plugin to suppress the MIME for Buffer error
class SuppressMimeErrorPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('SuppressMimeErrorPlugin', (stats) => {
      if (stats.compilation.errors) {
        stats.compilation.errors = stats.compilation.errors.filter((error) => {
          const errorString = error.toString();
          return !errorString.includes('Could not find MIME for Buffer');
        });
      }
    });
  }
}

module.exports = SuppressMimeErrorPlugin;
