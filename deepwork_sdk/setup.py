from setuptools import setup, find_packages

setup(
    name="deepwork_sdk",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "urllib3>=1.25.3",
        "python-dateutil",
        "requests>=2.0.0"
    ],
    description="DeepWork Session Tracker SDK",
    author="DeepWork Team",
    author_email="example@example.com",
    url="https://github.com/example/deepwork-sdk",
)
