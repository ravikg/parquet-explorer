#!/bin/bash

# Clear previous builds
rm -rf ./dist
mkdir ./dist

# Targets to build against
targets=(
    "win32-x64" # DuckDB appears to not have ia32 nor arm64 builds for Windows
    "linux-x64"
    "linux-arm64"
    "darwin-x64"
    "darwin-arm64"
)

for p in ${targets[@]}; do
    platform=$(echo $p | cut -d "-" -f 1)
    arch=$(echo $p | cut -d "-" -f 2)

    echo "========================================="
    echo "Building for $platform-$arch..."
    echo "========================================="

    # Download the right DuckDB binary for this target
    if ./node_modules/@mapbox/node-pre-gyp/bin/node-pre-gyp install --directory ./node_modules/duckdb --target_platform=$platform --target_arch=$arch --update-binary; then
        # Package extension
        if vsce package --target $platform-$arch --out ./dist; then
            echo "✅ Successfully built $platform-$arch"
        else
            echo "⚠️  Failed to package $platform-$arch (continuing...)"
        fi
    else
        echo "⚠️  Failed to download DuckDB binary for $platform-$arch (skipping...)"
    fi
done

echo ""
echo "========================================="
echo "Build Summary"
echo "========================================="
ls -lh ./dist/*.vsix 2>/dev/null || echo "No packages were created"
echo ""