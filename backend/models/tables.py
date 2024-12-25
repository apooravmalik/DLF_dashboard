from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from config.database import Base  # Assuming Base is defined in database.py

class PingTestTBL(Base):
    __tablename__ = 'PingTest_TBL'

    Device_PRK = Column(Integer, primary_key=True, autoincrement=True)
    ptsCurrentState_LNG = Column(Integer)
    ptsCameraZone_FRK = Column(Integer)
    ptsDeviceName_TXT = Column(String)

    # This can be used for relationships if necessary
    camera_zone = relationship("CameraZone", back_populates="ping_tests")

class CameraZone(Base):
    __tablename__ = 'CameraZone_TBL'

    CameraZone_FRK = Column(Integer, primary_key=True)
    CameraZone_Name = Column(String)

    # Relationship with PingTest_TBL
    ping_tests = relationship("PingTestTBL", back_populates="camera_zone")

class NVRChannels(Base):
    __tablename__ = 'NVRChannels'

    Channel_ID = Column(Integer, primary_key=True)
    ConnectionStatus = Column(Integer)

class Device(Base):
    __tablename__ = 'Device_TBL'

    Device_PRK = Column(Integer, primary_key=True)
    dvcDeviceType_FRK = Column(Integer)
    dvcStreet_FRK = Column(Integer)
    dvcName_TXT = Column(String)
    dvcCurrentState_TXT = Column(String)
    dvcCurrentStateSetTime_DTM = Column(DateTime)
    dvcBuilding_FRK = Column(Integer, ForeignKey('Building_TBL.Building_PRK'))

    # Relationships
    building = relationship("Building", back_populates="devices")

class Building(Base):
    __tablename__ = 'Building_TBL'

    Building_PRK = Column(Integer, primary_key=True)
    bldBuildingName_TXT = Column(String)

    # Relationships
    devices = relationship("Device", back_populates="building")

class Camera(Base):
    __tablename__ = 'Camera_TBL'

    Camera_PRK = Column(Integer, primary_key=True)
    Camera_Name = Column(String)

class GeoRollupCameraLink(Base):
    __tablename__ = 'GeoRollupCameraLink_TBL'

    Camera_FRK = Column(Integer, ForeignKey('Camera_TBL.Camera_PRK'))
    gclCamera_FRK = Column(Integer, ForeignKey('Camera_TBL.Camera_PRK'))

    camera = relationship("Camera", back_populates="geo_link")

class CameraStatus(Base):
    __tablename__ = 'CameraStatus'

    Total = Column(Integer)
    Online = Column(Integer)
    Offline = Column(Integer)

class FlapBarrierTurnstile(Base):
    __tablename__ = 'FlapBarrierTurnstile'

    Building_Name = Column(String)
    Online = Column(Integer)
    Offline = Column(Integer)
    Total = Column(Integer)

class ACSController(Base):
    __tablename__ = 'ACSController'

    Device_Name = Column(String)
    Status = Column(String)