import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()


install_requires = [
    'notebook',
    'requests>=2.9.1',
    'markdown>=2.6.0',
    'arrow>=0.12.1'
]

setuptools.setup(
    name="callisto-nbshare",
    version="0.0.2",
    author="cccs",
    author_email="",
    description="Share a notebook on Callisto",
    install_requires=install_requires,
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/cccs-is/callisto-nbshare",
    packages=setuptools.find_packages(),
    classifiers=(
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ),
    include_package_data = True,
    data_files = [
        ("etc/jupyter/jupyter_notebook_config.d", [
          "jupyter-config/jupyter_notebook_config.d/callisto_nbshare.json"
        ])
    ]

)
