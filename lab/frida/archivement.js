function readString(p) {
    var len = p.add(0x10).readU32();
    return p.add(0x14).readUtf16String(len);
}

var baseArr = mod.base.add(63921760) // ChallengeConfigurationRepository_TypeInfo -> ChallengeConfigurationRepository_c
    .readPointer().add(0xB8) // ChallengeConfigurationRepository_StaticFields
    .readPointer().readPointer() // System_Collections_Generic_List_ChallengeConfiguration__o


var len = baseArr.add(0x18).readInt()
var arr = baseArr.add(0x10).readPointer(); // ChallengeConfiguration_array*

for (var i = 0; i < len; i++) {
    var obj = arr.add(0x20 + i * 8).readPointer() // ChallengeConfiguration_o

    var desc = readString(obj.add(0x18).readPointer())
    console.log('Desc:', desc)

    // -- reward --
    var reward = obj.add(0x38).readPointer();
    var name = readString(reward.add(0x10).readPointer())
    var typeEntry = readString(reward.add(0x18).readPointer())
    var actionEntry = readString(reward.add(0x20).readPointer())
    console.log('Reward Name:', name)
    console.log('Type Entry:', typeEntry)
    console.log('Action Entry:', actionEntry)

    var order = obj.add(0x2C).readU32()
    console.log('Index:', order)
    var targetValue = obj.add(0x34).readInt();
    console.log('TargetValue:', targetValue)


    console.log('-'.repeat(20))
}