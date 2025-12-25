var mod = Process.findModuleByName("GameAssembly.dll");
var targetFunc = mod.base.add(6916448);

Interceptor.attach(targetFunc, {
    onEnter: function (args) {
        this.thisPtr = args[0];
    },
    onLeave: function (retval) {
        try {
            var strPtr = this.thisPtr.add(0x28).readPointer();
            if (strPtr.isNull()) {
                console.log("encryptionPassword is null");
                return;
            }

            var length = strPtr.add(0x10).readU32();
            var password = strPtr.add(0x14).readUtf16String(length);
            console.log("encryptionPassword: " + password);
        } catch (e) {
            console.log("Error: " + e);
            console.log(hexdump(this.thisPtr, { length: 64 }));
        }
    }
});