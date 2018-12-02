//
//  ViewController.swift
//  Server Bridge
//
//  Created by Christopher Wille on 11/20/18.
//  Copyright © 2018 Christopher Wille. All rights reserved.
//


//https://www.appcoda.com/socket-io-chat-app/
//https://medium.com/@rickredsix/getting-started-with-ios-swift-and-bluetooth-4-0-for-wearables-hardware-4661b1992bca
//https://developer.apple.com/documentation/iobluetooth
//https://developer.apple.com/documentation/iobluetoothui

// Put text input and send button at the bottom of the screen
// When keyboard comes in make it slide up and make the
// text display shorter

import UIKit
import Foundation
import SocketIO
import CoreLocation
import CoreMotion
import HealthKit

class ViewController: UIViewController, CLLocationManagerDelegate {
    
    // Setup variable inputs
    @IBOutlet var serverAddressInput: UITextField!
    @IBOutlet var serverPortInput: UITextField!
    @IBOutlet var deviceNameInput: UITextField!
    @IBOutlet weak var connectButtonOutlet: UIButton!
    @IBOutlet weak var locationSwitchText: UILabel!
    @IBOutlet weak var locationSwitchOutlet: UISwitch!
    
    //In use variable inputs and buttons
    @IBOutlet var testDataInput: UITextField!
    @IBOutlet weak var sendDataButtonOutlet: UIButton!
    @IBOutlet weak var disconnectButtonOutlet: UIButton!
    @IBOutlet weak var liveDataButtonOutlet: UIButton!
    @IBOutlet weak var consoleButtonOutlet: UIButton!
    @IBOutlet weak var textView: UITextView!
    @IBOutlet weak var liveDataTextView: UITextView!
    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var statusText: UILabel!
    @IBOutlet weak var lastPingLabel: UILabel!
    @IBOutlet weak var lastPingText: UILabel!
    
    // Setup initial socket variables
    var socketManager = SocketManager(socketURL: URL(string: "http://localhost:3000")!,config: [.log(true),.connectParams(["deviceName": "iPhone"])])
    
    var socket:SocketIOClient!
    
    // Initilize location services
    let locationManager = CLLocationManager()
    var latitude = ""
    var longitude = ""
    var altitude = ""
    var speed = ""
    var floor = ""
    var course = ""
    var locationAccuracy = ""
    var altitudeAccuracy = ""
    var locationEnabled = UserDefaults.standard.bool(forKey: "locationEnabled")
    
    // Initilize motion services
    let motionManager = CMMotionManager()
    let altitudeManager = CMAltimeter() // not implemented yet
    let stepManager = CMPedometer() // not implemented yet
    var motionEnabled = true
    
    // Initilize health services
    var postHealthNumber = 0
    var healthEnabled = true
    var stepCount = "0"
    var distance = "0"
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        testDataInput.isHidden = true
        sendDataButtonOutlet.isHidden = true
        disconnectButtonOutlet.isHidden = true
        liveDataButtonOutlet.isHidden = true
        consoleButtonOutlet.isHidden = true
        textView.isHidden = true
        liveDataTextView.isHidden = true
        statusLabel.isHidden = true
        statusText.isHidden = true
        lastPingLabel.isHidden = true
        lastPingText.isHidden = true
        
        serverAddressInput.text = UserDefaults.standard.string(forKey: "serverAddress") ?? ""
        serverPortInput.text = UserDefaults.standard.string(forKey: "serverPort") ?? ""
        deviceNameInput.text = UserDefaults.standard.string(forKey: "deviceName") ?? ""
        
    }
    

    @IBAction func locationSwitchChange(_ sender: UISwitch) {
        if sender.isOn {
            locationManager.startUpdatingLocation()
            locationEnabled = true
        } else {
            locationManager.stopUpdatingLocation()
            locationEnabled = false
        }
    }
    
    @IBAction func liveDataButtonAction(_ sender: Any) {
        liveDataButtonOutlet.isHidden = true
        consoleButtonOutlet.isHidden = false
        testDataInput.isHidden = true
        sendDataButtonOutlet.isHidden = true
        liveDataTextView.isHidden = false
    }
    
    @IBAction func consoleButtonAction(_ sender: Any) {
        liveDataButtonOutlet.isHidden = false
        consoleButtonOutlet.isHidden = true
        testDataInput.isHidden = false
        sendDataButtonOutlet.isHidden = false
        liveDataTextView.isHidden = true
    }
    
    
    @IBAction func connectActionButton(_ sender: Any) {
        
        //verify it starts with http (or https)
        let serverAddress = "\(serverAddressInput.text!)"
        let serverPort = "\(serverPortInput.text!)"
        let deviceName = "\(deviceNameInput.text!)"
        
        UserDefaults.standard.set(serverAddress, forKey: "serverAddress")
        UserDefaults.standard.set(serverPort, forKey: "serverPort")
        UserDefaults.standard.set(deviceName, forKey: "deviceName")
        UserDefaults.standard.set(locationEnabled, forKey: "locationEnabled")
        
        if (serverPort == "") {
            socketManager = SocketManager(socketURL: URL(string: "\(serverAddress)")!,config: [.log(true),.connectParams(["deviceName": "\(deviceName)"])])
        } else {
            socketManager = SocketManager(socketURL: URL(string: "\(serverAddress):\(serverPort)")!,config: [.log(true),.connectParams(["deviceName": "\(deviceName)"])])
        }
        
        socket = socketManager.defaultSocket
        
        serverAddressInput.isHidden = true
        serverPortInput.isHidden = true
        deviceNameInput.isHidden = true
        connectButtonOutlet.isHidden = true
        locationSwitchText.isHidden = true
        locationSwitchOutlet.isHidden = true
        
        testDataInput.isHidden = false
        sendDataButtonOutlet.isHidden = false
        disconnectButtonOutlet.isHidden = false
        liveDataButtonOutlet.isHidden = false
        consoleButtonOutlet.isHidden = true
        textView.isHidden = false
        liveDataTextView.isHidden = true
        statusLabel.isHidden = false
        statusText.isHidden = false
        lastPingLabel.isHidden = false
        lastPingText.isHidden = false
        
        self.showOutput(string: "Establishing websocket connection")
        self.showOutput(string: "Host: \(serverAddress):\(serverPort)")
        
        addHandlers()
        socket.connect()
        
    }
    
    @IBAction func disconnectActionButton(_ sender: Any) {
        
        socket.disconnect()
        
        serverAddressInput.isHidden = false
        serverPortInput.isHidden = false
        deviceNameInput.isHidden = false
        connectButtonOutlet.isHidden = false
        locationSwitchText.isHidden = false
        locationSwitchOutlet.isHidden = false
        textView.text = ""
        
        testDataInput.isHidden = true
        sendDataButtonOutlet.isHidden = true
        disconnectButtonOutlet.isHidden = true
        liveDataButtonOutlet.isHidden = true
        consoleButtonOutlet.isHidden = true
        textView.isHidden = true
        liveDataTextView.isHidden = true
        statusLabel.isHidden = true
        statusText.isHidden = true
        lastPingLabel.isHidden = true
        lastPingText.isHidden = true
    }
    
    @IBAction func sendMessageButton(_ sender: Any) {
//        if (locationEnabled == true) {
//            socket.emit("testData", "{\"data\": \"\(testDataInput.text!)\", \"lat\": \(latitude), \"long\": \(longitude), \"speed\": \(speed)}")
//            self.showOutput(string: "Data sent [testData]: {\"data\": \"\(testDataInput.text!)\", \"lat\": \(latitude), \"long\": \(longitude), \"speed\": \(speed)}")
//        } else {
//            socket.emit("testData", "{\"data\": \"\(testDataInput.text!)\"}")
//            self.showOutput(string: "Data sent [testData]: {\"data\": \"\(testDataInput.text!)\"}")
//        }
        self.testDataInput.text = ""
        startHealthUpdates()
    }
    
    
    // Creating and adding socket handlers
    func addHandlers() {
        
        socket.on(clientEvent: .connect) {data, ack in
            self.startLocationUpdates()
            self.startMotionUpdates()
            self.startHealthUpdates()
            self.showOutput(string: "Connection successful")
        }
        
        socket.on(clientEvent: .disconnect) {data, ack in
            self.locationManager.stopUpdatingLocation()
            self.showOutput(string: "Connection terminated")
        }
        
        socket.on("deviceAdded") {[weak self] data, ack in
            if let messageContents = data[0] as? String {
                self?.showOutput(string: "Device connected: \(messageContents)")
            } else {
                let dataType = "\(type(of: data[0]))"
                self?.showOutput(string: "Device connected")
                self?.showOutput(string: "Invalid device name: \(dataType)")
            }
        }
        
        socket.on("deviceRemoved") {[weak self] data, ack in
            if let messageContents = data[0] as? String {
                self?.showOutput(string: "Device disconnected: \(messageContents)")
            } else {
                let dataType = "\(type(of: data[0]))"
                self?.showOutput(string: "Device disconnected")
                self?.showOutput(string: "Invalid device name: \(dataType)")
            }
        }
        
        socket.on("statusChange") {[weak self] data, ack in
            self?.showOutput(string: "Status change: \(data[0])")
            self?.statusText.text = "\(data[0])"
        }
        
        socket.on("ping") {[weak self] data, ack in
            let date = Date()
            let calendar = Calendar.current
            var ampm = ""
            var hour = calendar.component(.hour, from: date)
            if Int(hour) < 12 {
                ampm = "AM"
            } else if Int(hour) == 12 {
                hour = 12
                ampm = "PM"
            } else {
                hour = Int(hour - 12)
                ampm = "PM"
            }
            
            let minutes = calendar.component(.minute, from: date)
            var minutesString = "\(minutes)"
            if Int(minutes) < 10 {
                minutesString = "0\(minutes)"
            }
            
            let seconds = calendar.component(.second, from: date)
            var secondsString = "\(seconds)"
            if Int(seconds) < 10 {
                secondsString = "0\(seconds)"
            }
            
            let currentTime = "\(hour):\(minutesString):\(secondsString) \(ampm)"
            self?.lastPingText.text = currentTime
        }

        socket.on("message") {[weak self] data, ack in
            if let messageType = data[0] as? String {
                
                if (data.indices.contains(1)) {
                
                    if (messageType == "data") {
                        if let messageContents = data[1] as? Dictionary<String,AnyObject> {
                            self?.showOutput(string: "Data received: \(messageContents)")
                        } else if let messageContents = data[1] as? String {
                            self?.showOutput(string: "Data received: \(messageContents)")
                        } else {
                            let dataType = "\(type(of: data[1]))"
                            self?.showOutput(string: "Invalid data received: \(dataType)")
                        }
                    }
                    
                    else if (messageType == "error") {
                        if let messageContents = data[1] as? String {
                            self?.showOutput(string: "Error: \(messageContents)")
                        } else {
                            let dataType = "\(type(of: data[1]))"
                            self?.showOutput(string: "Invalid error received: \(dataType)")
                        }
                    }
                    
                    else {
                        if let messageContents = data[1] as? Dictionary<String,AnyObject> {
                            self?.showOutput(string: "Unknown message type: \(messageType)")
                            self?.showOutput(string: "\(messageType): \(messageContents)")
                        } else if let messageContents = data[1] as? String {
                            self?.showOutput(string: "Unknown message type: \(messageType)")
                            self?.showOutput(string: "\(messageType): \(messageContents)")
                        } else {
                            let dataType = "\(type(of: data[1]))"
                            self?.showOutput(string: "Unknown message type: \(messageType)")
                            self?.showOutput(string: "Invalid message data: \(dataType)")
                        }
                    }
                    
                } else {
                    self?.showOutput(string: "Empty \(messageType) received")
                }

                
            } else {
                let dataType = "\(type(of: data[0]))"
                self?.showOutput(string: "Invalid message type: \(dataType)")
            }
        }

        socket.onAny {

            if ($0.event == "pong") {
                //do nothing for these except the else statement
            } else if ($0.event == "ping") {
                //Show last ping received at the top somewhere
                //self.showOutput(string: "Event: \($0.event)")
            } else if ($0.event == "connect") {
                
            } else if ($0.event == "reconnect") {
                
            } else if ($0.event == "error") {
                
            } else if ($0.event == "disconnect") {
                
            } else if ($0.event == "reconnectAttempt") {
                
            } else if ($0.event == "deviceAdded") {
                
            } else if ($0.event == "deviceRemoved") {
                
            } else if ($0.event == "statusChange") {
                if ("\($0.items![0])" == "connected") {
                    
                } else if ("\($0.items![0])" == "connecting") {

                } else if ("\($0.items![0])" == "disconnected") {
                    
                } else {
                    self.showOutput(string: "Socket status change: \($0.items![0])")
                }
            } else if ($0.event == "message") {
                
            } else {
                self.showOutput(string: "Event: \($0.event)")
                if ($0.items!.indices.contains(1)) {
                    self.showOutput(string: "Data: \($0.items![1])")
                } else {
                    self.showOutput(string: "Data: \($0.items![0])")
                }
            }

        }
    }
    
    private func socketConnected() -> Bool{
        if socket.status == .connected {
            return true
        }
        return false
    }

    private func showOutput(string: String, direction: String = "neither") {
        let date = Date()
        let calendar = Calendar.current
        var ampm = ""
        var hour = calendar.component(.hour, from: date)
        if Int(hour) < 12 {
            ampm = "AM"
        } else if Int(hour) == 12 {
            hour = 12
            ampm = "PM"
        } else {
            hour = Int(hour - 12)
            ampm = "PM"
        }
        
        let minutes = calendar.component(.minute, from: date)
        var minutesString = "\(minutes)"
        if Int(minutes) < 10 {
            minutesString = "0\(minutes)"
        }
        
        let seconds = calendar.component(.second, from: date)
        var secondsString = "\(seconds)"
        if Int(seconds) < 10 {
            secondsString = "0\(seconds)"
        }
        
        let currentTime = "\(hour):\(minutesString):\(secondsString) \(ampm)"
        
        var printDeviceName = ""
        if (direction == "incoming") {
            printDeviceName = "server"
        } else if (direction == "outgoing") {
            printDeviceName = "\(deviceNameInput.text!)"
        }
        
        if (printDeviceName == "") {
            DispatchQueue.main.async {
                
                self.textView.text = self.textView.text.appending("\n[\(currentTime)] \(string)")
                
            }
        } else {
            DispatchQueue.main.async {
                self.textView.text = self.textView.text.appending("\n[\(currentTime)] [\(printDeviceName)] \(string)")
            }
        }

        print(string)
        
        
        DispatchQueue.main.async {
            let point = CGPoint(x: 0.0, y: (self.textView.contentSize.height - self.textView.bounds.height))
            self.textView.setContentOffset(point, animated: true)
        }
    }
    
    
    private func startMotionUpdates() {
        if (motionEnabled == true) {
            if motionManager.isDeviceMotionAvailable {
                motionManager.startDeviceMotionUpdates()
                motionManager.startMagnetometerUpdates()
            } else {
                motionEnabled = false;
                print("Device motion not available")
            }
        }
    }
    
    func motionManager(_ manager: CMMotionManager, didChangeAuthorization status: CMAuthorizationStatus) {
        if(status == CMAuthorizationStatus.denied) {
            print("Motion is not authorized")
            motionEnabled = false
        }
    }
    
    func updateMotionData() {
        var outputString = "Current device values:"
        
        if (locationEnabled == true) {
            outputString = "\(outputString)\nLatitude: \(latitude) degrees"
            outputString = "\(outputString)\nLongitude: \(longitude) degrees"
            outputString = "\(outputString)\nLocation Accuracy: +/- \(locationAccuracy)m"
            outputString = "\(outputString)\nAltitude: \(altitude)m"
            outputString = "\(outputString)\nAltitude Accuracy: +/- \(altitudeAccuracy)m"
            outputString = "\(outputString)\nSpeed: \(speed)mps"
            outputString = "\(outputString)\nCourse: \(course) degrees"
            outputString = "\(outputString)\nFloor: \(floor)"
        }
        
        if (motionEnabled == true) {
            
            if var Heading = motionManager.deviceMotion?.heading {
                Heading = (motionManager.deviceMotion?.heading)!
                print("Heading: \(Heading)")
                outputString = "\(outputString)\nHeading: \(Heading)"
            }
            
            if var Acceleration = motionManager.accelerometerData?.acceleration.x {
                Acceleration = (motionManager.accelerometerData?.acceleration.x)!
                print("Acceleration: \(Acceleration)")
                outputString = "\(outputString)\nAcceleration: \(Acceleration)"
            }
            
            if var AccelerationX = motionManager.deviceMotion?.userAcceleration.x {
                AccelerationX = (motionManager.deviceMotion?.userAcceleration.x)!
                print("AccelerationX: \(AccelerationX)")
                outputString = "\(outputString)\nAcceleration X: \(AccelerationX)"
            }
            
            if var AccelerationY = motionManager.deviceMotion?.userAcceleration.y {
                AccelerationY = (motionManager.deviceMotion?.userAcceleration.y)!
                print("AccelerationY: \(AccelerationY)")
                outputString = "\(outputString)\nAcceleration Y: \(AccelerationY)"
            }
            
            if var AccelerationZ = motionManager.deviceMotion?.userAcceleration.z {
                AccelerationZ = (motionManager.deviceMotion?.userAcceleration.z)!
                print("AccelerationZ: \(AccelerationZ)")
                outputString = "\(outputString)\nAcceleration Z: \(AccelerationZ)"
            }
            
            if var RotationX = motionManager.deviceMotion?.rotationRate.x {
                RotationX = (motionManager.deviceMotion?.rotationRate.x)!
                print("RotationX: \(RotationX)")
                outputString = "\(outputString)\nRotation X: \(RotationX)"
            }
            
            if var RotationY = motionManager.deviceMotion?.rotationRate.y {
                RotationY = (motionManager.deviceMotion?.rotationRate.y)!
                print("RotationY: \(RotationY)")
                outputString = "\(outputString)\nRotation Y: \(RotationY)"
            }
            
            if var RotationZ = motionManager.deviceMotion?.rotationRate.z {
                RotationZ = (motionManager.deviceMotion?.rotationRate.z)!
                print("RotationZ: \(RotationZ)")
                outputString = "\(outputString)\nRotation Z: \(RotationZ)"
            }
            
            if var Pitch = motionManager.deviceMotion?.attitude.pitch {
                Pitch = (motionManager.deviceMotion?.attitude.pitch)!
                print("Pitch: \(Pitch)")
                outputString = "\(outputString)\nPitch: \(Pitch)"
            }
            
            if var Roll = motionManager.deviceMotion?.attitude.roll {
                Roll = (motionManager.deviceMotion?.attitude.roll)!
                print("Roll: \(Roll)")
                outputString = "\(outputString)\nRoll: \(Roll)"
            }
            
            if var Yaw = motionManager.deviceMotion?.attitude.yaw {
                Yaw = (motionManager.deviceMotion?.attitude.yaw)!
                print("Yaw: \(Yaw)")
                outputString = "\(outputString)\nYaw: \(Yaw)"
            }
            
            if var GravityX = motionManager.deviceMotion?.gravity.x {
                GravityX = (motionManager.deviceMotion?.gravity.x)!
                print("GravityX: \(GravityX)")
                outputString = "\(outputString)\nGravity X: \(GravityX)"
            }
            
            if var GravityY = motionManager.deviceMotion?.gravity.y {
                GravityY = (motionManager.deviceMotion?.gravity.y)!
                print("GravityY: \(GravityY)")
                outputString = "\(outputString)\nGravity Y: \(GravityY)"
            }
            
            if var GravityZ = motionManager.deviceMotion?.gravity.z {
                GravityZ = (motionManager.deviceMotion?.gravity.z)!
                print("GravityZ: \(GravityZ)")
                outputString = "\(outputString)\nGravity Z: \(GravityZ)"
            }
            
            if var QuaternionW = motionManager.deviceMotion?.attitude.quaternion.w {
                QuaternionW = (motionManager.deviceMotion?.attitude.quaternion.w)!
                print("QuaternionW: \(QuaternionW)")
                outputString = "\(outputString)\nQuaternion W: \(QuaternionW)"
            }
            
            if var QuaternionX = motionManager.deviceMotion?.attitude.quaternion.x {
                QuaternionX = (motionManager.deviceMotion?.attitude.quaternion.x)!
                print("QuaternionX: \(QuaternionX)")
                outputString = "\(outputString)\nQuaternion X: \(QuaternionX)"
            }
            
            if var QuaternionY = motionManager.deviceMotion?.attitude.quaternion.y {
                QuaternionY = (motionManager.deviceMotion?.attitude.quaternion.y)!
                print("QuaternionY: \(QuaternionY)")
                outputString = "\(outputString)\nQuaternion Y: \(QuaternionY)"
            }
            
            if var QuaternionZ = motionManager.deviceMotion?.attitude.quaternion.z {
                QuaternionZ = (motionManager.deviceMotion?.attitude.quaternion.z)!
                print("QuaternionZ: \(QuaternionZ)")
                outputString = "\(outputString)\nQuaternion Z: \(QuaternionZ)"
            }
            
            if var MagneticFieldX = motionManager.magnetometerData?.magneticField.x {
                MagneticFieldX = (motionManager.magnetometerData?.magneticField.x)!
                print("MagneticFieldX: \(MagneticFieldX)")
                outputString = "\(outputString)\nMagnetic Field X: \(MagneticFieldX)"
            }
            
            if var MagneticFieldY = motionManager.magnetometerData?.magneticField.y {
                MagneticFieldY = (motionManager.magnetometerData?.magneticField.y)!
                print("MagneticFieldY: \(MagneticFieldY)")
                outputString = "\(outputString)\nMagnetic Field Y: \(MagneticFieldY)"
            }
            
            if var MagneticFieldZ = motionManager.magnetometerData?.magneticField.z {
                MagneticFieldZ = (motionManager.magnetometerData?.magneticField.z)!
                print("MagneticFieldZ: \(MagneticFieldZ)")
                outputString = "\(outputString)\nMagnetic Field Z: \(MagneticFieldZ)"
            }
            
            if var MagneticFieldAccuracy = motionManager.deviceMotion?.magneticField.accuracy.rawValue {
                MagneticFieldAccuracy = (motionManager.deviceMotion?.magneticField.accuracy.rawValue)!
                print("MagneticFieldAccuracy: \(MagneticFieldAccuracy)")
                outputString = "\(outputString)\nMagnetic Field Accuracy: +/- \(MagneticFieldAccuracy)"
            }
            
            //still more things to get
            //https://developer.apple.com/documentation/coremotion/getting_raw_accelerometer_events
            
            //requires custom class?
            //https://developer.apple.com/documentation/coremotion/cmaltitudedata

            
            liveDataTextView.text = outputString
        }
    }
    
    
    func locationManager(_ locationManager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        
        altitude = "\(locationManager.location!.altitude)" //meters
        speed = "\(locationManager.location!.speed)" //meters per second
        floor = "\(String(describing: locationManager.location!.floor))"
        course = "\(locationManager.location!.course)" //degrees from north
        
        altitudeAccuracy = "\(locationManager.location!.verticalAccuracy)"
        locationAccuracy = "\(locationManager.location!.horizontalAccuracy)" //meters
        
        latitude = "\(locationManager.location!.coordinate.latitude)"
        longitude = "\(locationManager.location!.coordinate.longitude)"
        
        print("Location updated: (\(latitude), \(longitude)), accuracy: \(locationAccuracy)m")
        print("Altitude updated: \(altitude), accuracy: +/- \(altitudeAccuracy)m")
        print("Speed updated: \(speed) mps")
        print("Course updated: \(course)")
        print("Floor updated: \(String(describing: floor))")
        
        if (socket.status == .connected && postHealthNumber != 5) {
            
            socket.emit("locationData", "{\"lat\": \(latitude), \"long\": \(longitude), \"speed\": \(speed), \"altitude\": \(altitude)}")
            self.showOutput(string: "Data sent [locationData]: {\"lat\": \(latitude), \"long\": \(longitude), \"speed\": \(speed), \"altitude\": \(altitude)}")
            
        }
        
        updateMotionData()
        startHealthUpdates()
    }
    
    private func startLocationUpdates() {
        if (locationEnabled == true) {
            
            locationManager.requestAlwaysAuthorization()
            //locationManager.requestWhenInUseAuthorization()
            
            if CLLocationManager.locationServicesEnabled() {
                locationManager.delegate = self
                locationManager.desiredAccuracy = kCLLocationAccuracyBest // changes the locaiton accuary
                locationManager.startUpdatingLocation()
            }
        }
    }
    
    // If we have been deined access give the user the option to change it
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        if(status == CLAuthorizationStatus.denied) {
            showLocationDisabledPopUp()
        }
    }
    
    // Show the popup to the user if we have been deined access to location
    func showLocationDisabledPopUp() {
        let alertController = UIAlertController(title: "Location Access Disabled", message: "Please enable location services before continuing.", preferredStyle: .alert)
        
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel, handler: nil)
        alertController.addAction(cancelAction)
        
        let openAction = UIAlertAction(title: "Open Settings", style: .default) { (action) in
            if let url = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            }
        }
        alertController.addAction(openAction)
        
        self.present(alertController, animated: true, completion: nil)
    }
    
    func startHealthUpdates() {
        if (healthEnabled == true && postHealthNumber == 2) {
            if HKHealthStore.isHealthDataAvailable() {
                print("Starting health updates...")
                
                let healthKitDataStore: HKHealthStore?
                
                let readableHKCharacteristicTypes: Set<HKCharacteristicType>?
                
                let readableHKDataTypes: Set<HKSampleType>?
                
                if HKHealthStore.isHealthDataAvailable() {
                    
                    healthKitDataStore = HKHealthStore()
                    
                    readableHKDataTypes = [HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRate)!, HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.restingHeartRate)!, HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.walkingHeartRateAverage)!, HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.activeEnergyBurned)!, HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.basalEnergyBurned)!, HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.dietaryEnergyConsumed)!, HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.uvExposure)!, HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.appleExerciseTime)!, HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.stepCount)!, HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.bodyMass)!, HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.bodyMassIndex)!, HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.height)!, HKSampleType.quantityType(forIdentifier: HKQuantityTypeIdentifier.distanceWalkingRunning)!]
                    
                    readableHKCharacteristicTypes = [HKCharacteristicType.characteristicType(forIdentifier: HKCharacteristicTypeIdentifier.biologicalSex)!]
                    
                    healthKitDataStore?.requestAuthorization(toShare: nil, read: readableHKCharacteristicTypes, completion: { (success, error) -> Void in
                        if success {
                            print("Successful static health data authorization.")
                            
                            healthKitDataStore?.requestAuthorization(toShare: nil, read: readableHKDataTypes, completion: { (success, error) -> Void in
                                if success {
                                    print("Successful dynamic health data authorization.")
                                    
                                    var genderString = ""
                                    do {
                                        let genderType = try healthKitDataStore?.biologicalSex()
                                        if genderType?.biologicalSex == .female {
                                            genderString = ", \"gender\": \"female\""
                                        } else if genderType?.biologicalSex == .male {
                                            genderString = ", \"gender\": \"male\""
                                        } else {
                                            genderString = ", \"gender\": \"undefined\""
                                        }
                                    }
                                    catch {
                                        print("Error looking up gender.")
                                    }
                                    
                                 
                                    
                                    let heartRateType = HKQuantityType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRate)!

                                    let query = HKAnchoredObjectQuery(type: heartRateType, predicate: nil, anchor: nil,  limit: HKObjectQueryNoLimit) {
                                        (query, samplesOrNil, deletedObjectsOrNil, newAnchor, errorOrNil) in
                            
                                        if let samples = samplesOrNil {
                                            
                                            if (samples.count > 0) {
                                                
                                                let heartRate = "\(String(describing: samples.last))"
                                                
                                                print(heartRate)
                                                
                                                
                                                
                                                let stepCountType = HKQuantityType.quantityType(forIdentifier: HKQuantityTypeIdentifier.stepCount)!
                                                
                                                let stepQuery = HKAnchoredObjectQuery(type: stepCountType, predicate: nil, anchor: nil,  limit: HKObjectQueryNoLimit) {
                                                    (query, samplesOrNil, deletedObjectsOrNil, newAnchor, errorOrNil) in
                                                    
                                                    if let samples = samplesOrNil {
                                                        
                                                        if (samples.count > 0) {
                                                            
                                                            self.stepCount = "\(String(describing: samples.last).prefix(12).suffix(3))"
                                                            
                                                            if (self.stepCount.suffix(1) == "c") {
                                                                self.stepCount = String(self.stepCount.prefix(2))
                                                            }

                                                            print(self.stepCount)
   
                                                        }
                                                    } else {
                                                        print("No step sample available.")
                                                    }
                                                    
                                                }
                                                
                                                healthKitDataStore?.execute(stepQuery)
                                                
                                                let distanceType = HKQuantityType.quantityType(forIdentifier: HKQuantityTypeIdentifier.distanceWalkingRunning)!
                                                
                                                let distanceQuery = HKAnchoredObjectQuery(type: distanceType, predicate: nil, anchor: nil,  limit: HKObjectQueryNoLimit) {
                                                    (query, samplesOrNil, deletedObjectsOrNil, newAnchor, errorOrNil) in
                                                    
                                                    if let samples = samplesOrNil {
                                                        
                                                        if (samples.count > 0) {
                                                            
                                                            //self.distance = "\(String(describing: samples.last).prefix(12).suffix(3))"
                                                            
                                                            self.distance = "\(String(describing: samples.last))"
                                                            
                                                            self.distance = String(self.distance.components(separatedBy: "m")[0])
                                                            self.distance = String(self.distance.components(separatedBy: "(")[1])

                                                            print(self.distance)
                                                            
                                                        }
                                                    } else {
                                                        print("No distance sample available.")
                                                    }
                                                    
                                                }
                                                
                                                healthKitDataStore?.execute(distanceQuery)
                                                
                                                var heartRateString = "{\"heartRate\": \(heartRate.prefix(12).suffix(3))\(genderString)}"
                                                
                                                if (self.stepCount != "0") {
                                                    heartRateString = "{\"heartRate\": \(heartRate.prefix(12).suffix(3))\(genderString), \"stepCount\": \(self.stepCount)}"
                                                    if (self.distance != "0") {
                                                        heartRateString = "{\"heartRate\": \(heartRate.prefix(12).suffix(3))\(genderString), \"stepCount\": \(self.stepCount), \"distance\": \(self.distance)}"
                                                    }
                                                }
                                                
                                                if self.socket.status == .connected {
                                                    self.socket.emit("healthData", heartRateString)
                                                    self.showOutput(string: "Data sent [healthData]: \(heartRateString)")
                                                }
                                                self.postHealthNumber = 0
                                            }
                                        } else {
                                            print("No heart rate sample available.")
                                        }
                                        
                                    }
                                    
                                    healthKitDataStore?.execute(query)
                                    
                                    

                                    
                                    
                                } else {
                                    print(error.debugDescription)
                                }
                            })
                        } else {
                            print(error.debugDescription)
                        }
                    })
                } else {
                    healthKitDataStore = nil
                    readableHKCharacteristicTypes = nil
                }
            } else {
                healthEnabled = false
            }
        } else {
            postHealthNumber = postHealthNumber + 1
        }
    }
    
    
    

}

