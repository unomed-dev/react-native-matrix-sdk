import Foundation

extension MatrixSdk {
    @objc(multiply:b:)
    func multiply(a: Double, b: Double) -> NSNumber {
        return NSNumber(value: a * b)
    }
}
