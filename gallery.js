function Gallery() {
    var _gallery = this;
    
    var configuration = require('./config');
    var fs = require('fs');
    var path = require('path');
    
    _gallery.buildThumbPath = function(relative) {
        var extension = path.extname(relative);
        var fileName = path.basename(relative, extension);

        return path.join(path.dirname(relative), configuration.thumbsDir, extension.replace('.', ''), fileName + ".jpg");
    }

    _gallery.buildList = function(dir, files) {
        var ret = [];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fullPath = path.join(dir, file);
            
            var relative = fullPath.substring(configuration.galleryRoot.length-1);
            ret.push({
                        name: path.join(relative),
                        thumb: _gallery.buildThumbPath(relative)
            });
        }
        
        return ret;
    }
    
    _gallery.buildDirectoriesList = function(dir) {
        var ret = [];
        var files = fs.readdirSync(dir).filter(function(file) {
                return fs.statSync(path.join(dir, file)).isDirectory() && file != configuration.thumbsDir;
            });

        for (var i = 0; i < files.length; i++) {
            var relative = path.join(dir, files[i]).substring(configuration.galleryRoot.length-1);
            ret.push({
                path: path.join(relative),
                name: path.basename(relative)
            });
            
            ret = ret.concat(_gallery.buildDirectoriesList(path.join(dir, files[i])));
        }
        
        return ret;
    }
    
    return {
        list: function(req, res) {
            var requestedDirectory = req.params.directory || '';
            var basedir = path.join(configuration.galleryRoot, requestedDirectory);
            
            var files = fs.readdirSync(basedir).filter(function(file) {
                return !fs.statSync(path.join(basedir, file)).isDirectory();
            });
            
            var response = {
                files: _gallery.buildList(basedir, files)
            };
            
            res.json(response.files);
        },
        
        listDirectories: function(req, res) {
            var response = {
              dirs: _gallery.buildDirectoriesList(configuration.galleryRoot).concat([{ path: '', name: '/'}])
            };
            
            res.json(response.dirs);
        }
    }
}

module.exports = Gallery;