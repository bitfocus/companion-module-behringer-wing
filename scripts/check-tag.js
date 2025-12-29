import { execSync } from 'child_process'
import * as fs from 'fs'

function run(cmd) {
	try {
		return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim()
	} catch {
		return null
	}
}

if (!fs.existsSync('package.json')) {
	throw new Error('package.json not found')
}

const tag = run('git describe --tags --abbrev=0')

if (!tag) {
	throw new Error('No git tag found on this branch')
}

if (!/^v\d+(\.\d+){2,3}$/.test(tag)) {
	throw new Error(`Latest tag '${tag}' does not match vX.Y.Z or vX.Y.Z.W`)
}

let pkg
try {
	pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
} catch {
	throw new Error('Cannot parse package.json')
}

const pkgVersion = pkg.version
const tagVersion = tag.slice(1)

if (pkgVersion !== tagVersion) {
	throw new Error(`ERROR: package.json version (${pkgVersion}) does not match git tag (${tag})`)
}

console.log(`Git tag '${tag}' matches package.json version '${pkgVersion}'`)
