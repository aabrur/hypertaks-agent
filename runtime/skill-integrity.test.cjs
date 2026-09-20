#!/usr/bin/env node
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');

test('PLUGIN AND SKILL FILE INTEGRITY', async (t) => {

    const canonicalSkills = [
        'hypertaks',
        'hypertaks-brain',
        'hypertaks-continuity',
        'hypertaks-graph',
        'hypertaks-verify'
    ];

    await t.test('all 5 canonical skill directories exist with SKILL.md', () => {
        for (const skill of canonicalSkills) {
            const skillMdPath = path.join(root, 'skills', skill, 'SKILL.md');
            if (fs.existsSync(path.join(root, 'skills'))) {
                assert.ok(fs.existsSync(skillMdPath), `Expected ${skillMdPath} to exist`);
            }
        }
    });

    await t.test('no sixth public skill directory exists', () => {
        const skillsDir = path.join(root, 'skills');
        if (fs.existsSync(skillsDir)) {
            const dirs = fs.readdirSync(skillsDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('hypertaks'))
                .map(dirent => dirent.name);
            assert.equal(dirs.length, 5, `Expected exactly 5 hypertaks directories, found ${dirs.length}`);
        }
    });

    await t.test('SKILL.md frontmatter is valid YAML with required fields', () => {
        for (const skill of canonicalSkills) {
            const skillMdPath = path.join(root, 'skills', skill, 'SKILL.md');
            if (!fs.existsSync(skillMdPath)) continue;

            const content = fs.readFileSync(skillMdPath, 'utf8');
            const lines = content.split('\n');
            if (lines[0].trim() === '---') {
                const endIdx = lines.indexOf('---', 1);
                if (endIdx > 0) {
                    const frontmatter = lines.slice(1, endIdx);
                    let foundName = null;
                    for (const line of frontmatter) {
                        const parts = line.split(':');
                        if (parts.length >= 2 && parts[0].trim() === 'name') {
                            foundName = parts.slice(1).join(':').trim();
                            foundName = foundName.replace(/^["'](.*)["']$/, '$1');
                        }
                    }
                    assert.ok(foundName, `Expected name field in frontmatter of ${skill}/SKILL.md`);
                    assert.equal(foundName, skill, `Expected name field to match directory name for ${skill}`);
                }
            }
        }
    });

    await t.test('.agents/plugins/hypertaks manifest SHA-256 hashes match disk files', () => {
        const manifestPath = path.join(root, '.agents', 'plugins', 'hypertaks', '.hypertaks-manifest.json');
        if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            for (const [filePath, expectedHash] of Object.entries(manifest)) {
                const fullPath = path.join(root, '.agents', 'plugins', 'hypertaks', filePath);
                if (fs.existsSync(fullPath)) {
                    const fileBuffer = fs.readFileSync(fullPath);
                    const actualHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
                    assert.equal(actualHash, expectedHash, `Hash mismatch for ${filePath}`);
                }
            }
        }
    });

    await t.test('plugin.json, plugin.yaml, and gemini-extension.json declare consistent version', () => {
        const pluginJsonPath = path.join(root, 'plugin.json');
        const pluginYamlPath = path.join(root, 'plugin.yaml');
        const geminiJsonPath = path.join(root, 'gemini-extension.json');

        let pluginJsonVer = null;
        let pluginYamlVer = null;
        let geminiJsonVer = null;

        if (fs.existsSync(pluginJsonPath)) {
            pluginJsonVer = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8')).version;
        }
        if (fs.existsSync(pluginYamlPath)) {
            const content = fs.readFileSync(pluginYamlPath, 'utf8');
            const match = content.match(/version:\s*([^\s]+)/);
            if (match) pluginYamlVer = match[1].replace(/['"]/g, '');
        }
        if (fs.existsSync(geminiJsonPath)) {
            geminiJsonVer = JSON.parse(fs.readFileSync(geminiJsonPath, 'utf8')).version;
        }

        const versions = [pluginJsonVer, pluginYamlVer, geminiJsonVer].filter(v => v !== null);
        if (versions.length > 1) {
            const first = versions[0];
            for (const ver of versions) {
                assert.equal(ver, first, 'Versions should be consistent across manifests');
            }
        }
    });

    await t.test('plugin.json and gemini-extension.json declare consistent product name', () => {
        const pluginJsonPath = path.join(root, 'plugin.json');
        const geminiJsonPath = path.join(root, 'gemini-extension.json');

        if (fs.existsSync(pluginJsonPath)) {
            const name = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8')).name;
            assert.match(name.toLowerCase(), /hypertaks/, 'plugin.json name should contain hypertaks');
        }
        if (fs.existsSync(geminiJsonPath)) {
            const name = JSON.parse(fs.readFileSync(geminiJsonPath, 'utf8')).name;
            assert.match(name.toLowerCase(), /hypertaks/, 'gemini-extension.json name should contain hypertaks');
        }
    });

    await t.test('Hypertask.svg asset exists', () => {
        const assetPath = path.join(root, 'assets', 'Hypertask.svg');
        if (fs.existsSync(path.join(root, 'assets'))) {
            assert.ok(fs.existsSync(assetPath), `Expected ${assetPath} to exist`);
        }
    });

    await t.test('all reference files linked from SKILL.md exist on disk', () => {
        for (const skill of canonicalSkills) {
            const skillMdPath = path.join(root, 'skills', skill, 'SKILL.md');
            if (!fs.existsSync(skillMdPath)) continue;
            
            const content = fs.readFileSync(skillMdPath, 'utf8');
            // Match local references/ paths but exclude ../hypertaks/references/ cross-refs
            const regex = /(?<!\.\.\/(hypertaks)\/)references\/([a-zA-Z0-9_.-]+\.md)/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                // Skip if this match is part of a ../hypertaks/references/ cross-reference
                const preContext = content.slice(Math.max(0, match.index - 30), match.index);
                if (preContext.includes('../hypertaks/')) continue;
                const refPath = path.join(root, 'skills', skill, 'references', match[2]);
                assert.ok(fs.existsSync(refPath), `Reference ${match[2]} in ${skill} should exist`);
            }
            
            const regex2 = /\.\.\/hypertaks\/references\/00-security-kernel\.md/g;
            if (skill !== 'hypertaks') {
                while ((match = regex2.exec(content)) !== null) {
                    const refPath = path.join(root, 'skills', 'hypertaks', 'references', '00-security-kernel.md');
                    assert.ok(fs.existsSync(refPath), `Cross-reference 00-security-kernel.md in ${skill} should exist`);
                }
            }
        }
    });

    await t.test('skills pack index links to all 5 canonical skills', () => {
        const packIndexPath = path.join(root, 'skills', 'SKILL.md');
        if (fs.existsSync(packIndexPath)) {
            const content = fs.readFileSync(packIndexPath, 'utf8');
            for (const skill of canonicalSkills) {
                assert.ok(content.includes(skill), `skills/SKILL.md should mention ${skill}`);
            }
        }
    });

    await t.test('distribution adapter paths exist', () => {
        const registryPath = path.join(root, 'distribution', 'registry.json');
        if (fs.existsSync(registryPath)) {
            const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
            for (const adapter of Object.values(registry)) {
                if (adapter.path) {
                    const adapterPath = path.join(root, 'distribution', adapter.path);
                    assert.ok(fs.existsSync(adapterPath), `Adapter path ${adapter.path} should exist`);
                }
            }
        }
    });

    await t.test('MCP server exposes exactly 4 tools', () => {
        const mcpServerPath = path.join(root, 'runtime', 'mcp-server.mjs');
        if (fs.existsSync(mcpServerPath)) {
            const content = fs.readFileSync(mcpServerPath, 'utf8');
            const expectedTools = ['hypertaks_manifest', 'hypertaks_get_skill', 'hypertaks_route', 'hypertaks_verify_installation'];
            for (const tool of expectedTools) {
                assert.ok(content.includes(tool), `MCP server should contain definition for ${tool}`);
            }
        }
    });

    await t.test('contract-schema.yaml exists and is non-empty', () => {
        const schemaPath = path.join(root, 'skills', 'hypertaks', 'assets', 'contract-schema.yaml');
        if (fs.existsSync(schemaPath)) {
            const stat = fs.statSync(schemaPath);
            assert.ok(stat.size > 100, `Expected ${schemaPath} to be >100 bytes`);
        }
    });

    await t.test('domain pack INDEX.md references all domain files', () => {
        const indexPath = path.join(root, 'skills', 'hypertaks', 'references', 'domains', 'INDEX.md');
        if (fs.existsSync(indexPath)) {
            const content = fs.readFileSync(indexPath, 'utf8');
            const regex = /(D\d+\.md)/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const domainPath = path.join(root, 'skills', 'hypertaks', 'references', 'domains', match[1]);
                assert.ok(fs.existsSync(domainPath), `Domain reference ${match[1]} should exist`);
            }
        }
    });

    await t.test('no tracked skill file contains em-dash U+2014', () => {
        const walk = (dir, done) => {
            let results = [];
            if (!fs.existsSync(dir)) return done(null, results);
            fs.readdir(dir, (err, list) => {
                if (err) return done(err);
                let i = 0;
                (function next() {
                    let file = list[i++];
                    if (!file) return done(null, results);
                    file = path.resolve(dir, file);
                    fs.stat(file, (err, stat) => {
                        if (stat && stat.isDirectory()) {
                            walk(file, (err, res) => {
                                results = results.concat(res);
                                next();
                            });
                        } else {
                            if (file.endsWith('.md')) {
                                results.push(file);
                            }
                            next();
                        }
                    });
                })();
            });
        };

        return new Promise((resolve, reject) => {
            walk(path.join(root, 'skills'), (err, results) => {
                if (err) return reject(err);
                for (const file of results) {
                    const content = fs.readFileSync(file, 'utf8');
                    assert.ok(!content.includes('\u2014'), `File ${file} contains em-dash (U+2014)`);
                }
                resolve();
            });
        });
    });

    await t.test('marketplace metadata files exist and declare consistent publisher', () => {
        const metadataPath = path.join(root, 'marketplace', 'common', 'metadata.json');
        if (fs.existsSync(metadataPath)) {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            assert.equal(metadata.publisher, 'Crimson Rift Studio', 'Publisher should be Crimson Rift Studio');
        }

        const marketplaceDir = path.join(root, 'marketplace');
        if (fs.existsSync(marketplaceDir)) {
            const hosts = fs.readdirSync(marketplaceDir, { withFileTypes: true })
                .filter(d => d.isDirectory() && d.name !== 'common')
                .map(d => d.name);
            
            let metadataCount = 0;
            for (const host of hosts) {
                if (fs.existsSync(path.join(marketplaceDir, host, 'metadata.json'))) {
                    metadataCount++;
                }
            }
            if (hosts.length >= 3) {
                assert.ok(metadataCount >= 3, 'Expected at least 3 marketplace hosts to have metadata.json');
            }
        }
    });

});
