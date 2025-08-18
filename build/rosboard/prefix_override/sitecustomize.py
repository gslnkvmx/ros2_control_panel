import sys
if sys.prefix == '/usr':
    sys.real_prefix = sys.prefix
    sys.prefix = sys.exec_prefix = '/home/benya/PycharmProjects/ros2_control_panel/install/rosboard'
