(() => {
    Vue.component('byte-container', {
        props: [ 'path', 'set_path' ],

        template: `
            <div class="byte-container">
                <path-crumbs :path="path" :set_path="set_path"></path-crumbs>
                <path-list :path="path" :set_path="set_path"></path-list>
            </div>
        `
    });
})();

(() => {
    Vue.component('path-crumbs', {
        props: [ 'path', 'set_path' ],

        computed: {
            file_path() { return this.path; },
            segments() { return this.file_path.split('/') }
        },

        mounted: function() {
            console.log(this.path, this.file_path);
        },

        template: `
            <div class="path-crumbs">
            <span class="crumb-text" @click="set_path('/f/')">root</span><template v-for="(s, i) in segments">
                    <span class="crumb-slash">/</span><span class="crumb-text" :key="i" @click="set_path('/f/' + segments.slice(0, i+1).join('/'))">{{decodeURI(s)}}</span>
                </template>
            </div>
        `
    });
})();

(() => {
    Vue.component('path-list', {
        props: [ 'path', 'set_path' ],

        data: () => {
            return {
                map: null
            }
        },

        computed: {
            file_path() { return this.path; }
        },

        watch: {
            path: function() {
                this.populate()
            }
        },

        methods: {
            async populate() {
                this.map = null;
                try {
                    let paths = await (await fetch(`http://localhost:8080/a/dir/${encodeURI(this.file_path)}`)).json();
                    paths.sort((a, b) => {
                        // a and b are of the same type
                        if ((a.type == 'DIRECTORY' && b.type == 'DIRECTORY') || (a.type == 'FILE' && b.type == 'FILE')) {
                            if (a.name < b.name) { return -1 }
                            if (a.name > b.name) { return 1 }
                            return 0;
                        }
        
                        else {
                            if (a.type == 'FILE' && b.type == 'DIRECTORY') { return -1 }
                            if (a.type == 'DIRECTORY' && b.type == 'FILE') { return 1 }
                            return 0;
                        }
                    });
        
                    this.map = paths;
                }
                
                catch {};
            }
        },

        mounted: function() {
            this.populate();
        },

        template: `
            <div class="path-list">
                <template v-if="map != null">
                    <path-list-item v-if="file_path != ''" :data="{ type: 'DIRECTORY', name: '.. (back)' }" :path="path" :set_path="set_path"></path-list-item>
                    <path-list-item v-for="(p, i) in map" :key="i" :data="p" :path="path" :set_path="set_path"></path-list-item>
                </template>
            </div>
        `
    });
})();

(() => {
    Vue.component('path-list-item', {
        props: [ 'data', 'path', 'set_path' ],

        computed: {
            file_path() { return this.path; }
        },

        methods: {
            navigate: function() {
                if (this.data.type == 'DIRECTORY') {
                    let path = `${this.file_path}/${this.data.name}`;
                    if (this.data.name == '.. (back)') { path = path.split('/').slice(0, -2).join('/') }
                    if (path.startsWith('/')) { path = path.slice(1) }
                    this.set_path(path);
                }

                else if (this.data.type == 'FILE') {
                    //let path = `${this.file_path}/${this.data.name}`;
                    
                    //let a = document.createElement("a");
                    //a.href = `/r/${encodeURI(path)}`;
                    //a.setAttribute("download", this.data.name);
                    //a.click();
                }
            }
        },

        mounted: function() {
            
        },

        template: `
            <div class="path-item">
                <div class="path-icon">
                    <div class="icon">
                        <i v-if="data.type == 'DIRECTORY'" class="mdi mdi-folder"></i>
                        <i v-else class="mdi mdi-file"></i>
                    </div>
                </div>
                <div class="path-container" @click="navigate()">
                    <p class="path-label">{{data.name}}</p>
                </div>
            </div>
        `
    });
})();