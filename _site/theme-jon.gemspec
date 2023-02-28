# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "theme-jon"
  spec.version       = "0.1.0"
  spec.authors       = ["Zhang Shuo"]
  spec.email         = ["zshowing@gmail.com"]

  spec.summary       = "Test for now."
  spec.homepage      = "https://zshowing.github.io"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(assets|_layouts|_includes|_sass|LICENSE|README|_config\.yml)!i) }
end
