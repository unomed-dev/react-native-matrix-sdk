require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "react-native-matrix-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/unomed-dev/react-native-matrix-sdk.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  # This appears to be required if we ever need to import react_native_matrix_sdk-Swift.h
  # s.header_dir = 'react_native_matrix_sdk'

  # For testing & production
  ffi = ->(version) { return {
    :xcf_zip => "MatrixSDKFFI-#{version}.xcframework.zip",
    :xcf_url => "https://github.com/matrix-org/matrix-rust-components-swift/releases/download/v#{version}/MatrixSDKFFI.xcframework.zip",
    :src_dir => "matrix-rust-components-swift-#{version}",
    :src_zip => "matrix-rust-components-swift-#{version}.zip",
    :src_url => "https://github.com/matrix-org/matrix-rust-components-swift/archive/refs/tags/v#{version}.zip"
  } }.call("1.1.68")

  s.prepare_command = <<-CMD
    # Prepare target folder
    target=$(pwd)/ios/MatrixRustSDK
    mkdir -p "${target}"

    cd "${target}"

    # Fetch MatrixSDKFFI.xcframework & sources
    if [[ ! -e "#{ffi[:xcf_zip]}" ]]; then
      rm -rf *
      curl -L -o "#{ffi[:xcf_zip]}" "#{ffi[:xcf_url]}"
      curl -L -o "#{ffi[:src_zip]}" "#{ffi[:src_url]}"
    fi

    # Unzip the sources
    rm -f *.swift
    unzip "#{ffi[:src_zip]}"
    mv "#{ffi[:src_dir]}"/Sources/MatrixRustSDK/* .
    rm -r "#{ffi[:src_dir]}"

    # Unzip the xcframework
    rm -rf *.xcframework
    unzip "#{ffi[:xcf_zip]}"
  CMD

  s.vendored_frameworks = "ios/MatrixRustSDK/MatrixSDKFFI.xcframework"

  # Use install_modules_dependencies helper to install the dependencies if React Native version >=0.71.0.
  # See https://github.com/facebook/react-native/blob/febf6b7f33fdb4904669f99d795eba4c0f95d7bf/scripts/cocoapods/new_architecture.rb#L79.
  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"

    # Don't install the dependencies when we run `pod install` in the old architecture.
    if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
      s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
      s.pod_target_xcconfig    = {
          "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
          "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
          "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
      }
      s.dependency "React-Codegen"
      s.dependency "RCT-Folly"
      s.dependency "RCTRequired"
      s.dependency "RCTTypeSafety"
      s.dependency "ReactCommon/turbomodule/core"
    end
  end
end
