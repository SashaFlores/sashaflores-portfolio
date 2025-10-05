package postcounters

type Pair struct {
    Likes string
    Views string
}

var counters = map[string]Pair{
    "gold-protocol":                {Likes: "goldprotocollikes", Views: "goldprotocolviews"},
    "swissborg-breach":             {Likes: "swissborgbreachlikes", Views: "swissborbreachviews"},
    "two-exploits-part2":           {Likes: "twoexploitspart2likes", Views: "twoexploitspart2views"},
    "two-exploits-part1":           {Likes: "twoexploitspart1likes", Views: "twoexploitspart1views"},
    "subgraphs-substreams":         {Likes: "subgraphssubstreamslikes", Views: "subgraphssubstreamsviews"},
    "validator-node":               {Likes: "validatornodelikes", Views: "validatornodeviews"},
    "version-control":              {Likes: "versioncontrolikes", Views: "versioncontroviews"},
    "inline-assembly":              {Likes: "inlineassembllikes", Views: "inlineassemblviews"},
    "multiple-ssh-keys":            {Likes: "multiplesshkeyslikes", Views: "multiplesshkeysviews"},
    "gas-bytecode-optimization":    {Likes: "gasBytecodeoptimizationlikes", Views: "gasBytecodeoptimizationviews"},
    "shanghai-upgrade":             {Likes: "shanghaiupgradelikes", Views: "shanghaiupgradeviews"},
    "eip-712":                      {Likes: "eip712likes", Views: "eip712views"},
    "ecdsa-keys":                   {Likes: "ecdsakeyslikes", Views: "ecdsakeysviews"},
    "gitbash-installation":         {Likes: "gitbashinstallationlikes", Views: "gitbashinstallationviews"},
}

func Lookup(slug string) (Pair, bool) {
    pair, ok := counters[slug]
    return pair, ok
}

func All() map[string]Pair {
    clone := make(map[string]Pair, len(counters))
    for slug, pair := range counters {
        clone[slug] = pair
    }
    return clone
}
