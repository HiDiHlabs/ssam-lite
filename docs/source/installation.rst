############
Installation
############

SSAM-lite comes in two flavours -- SSAM-lite and SSAM-lite-server.
While the usage is almost identical the installation differs quite a lot.
If you need some help deciding which of the two fits your needs best and 
what the differences are follow the guide ":ref:`local-or-server`"

.. image:: ../res/imgs/solo_vs_server.png
  :width: 400
  :align: center
  :alt: Setup for SSAM-lite vs server


.. _requirements:

Requirements
============

..
    TODO Check requirements

SSAM-lite and SSAM-lite-server should run on all modern browsers supporting JavaScript ES5 
and webGL.

SSAM-lite requires an internet connection to access the TensorFlow.js (v2.0.0) 
library.

SSAM-lite-server requires Python (v3.9.7) as well as the Python packages 
Flask (v0.8), pandas (v1.3.2) and NumPy (v1.20.3). It also requires the 
TensorFlow.js (v2.0.0) library, however, this will be downloaded upon first setup 
and after that, no internet connection is required anymore.


SSAM-lite
=========

SSAM-lite is accesible via https://ssam-lite.netlify.app, and does not need to be installed.

However, if you want to have a local copy of the code, installation is possible and 
could not be easier. You either clone the `GitHub repository <https://github.com/HiDiHlabs/ssam-lite>`__

.. code-block:: bash

   git clone https://github.com/HiDiHlabs/ssam-lite.git


or click `here <https://github.com/HiDiHlabs/ssam-lite/archive/refs/heads/main.zip>`__ 
to download it as zip-file from GitHub and then extract it.

That is literally all, you are ready to go.


SSAM-lite-server
================

To install SSAM-lite-server you first need to clone the
`GitHub repository <https://github.com/HiDiHlabs/ssam-lite-server>`__

.. code-block:: bash

    git clone https://github.com/HiDiHlabs/ssam-lite-server.git


Change directory to the cloned folder 
Next we create a ``conda`` environment and activate it.

.. code-block:: bash

    conda env create -f environment_ssam-lite-server.yml
    conda activate ssam-lite-server

.. note::

    You can set the environment name to your preferences.
    To install the package into already existing conda environment please install
    the following packages using the command.

    .. code-block:: bash
        conda install python=3.9.7 flask=0.8 numpy=1.20.3 pandas=1.3.2


Retireve the static files required by first .

.. code-block:: bash

    python fetch_static_files.py


Download the background signature matrix from Dropbox <https://www.dropbox.com/s/8qxkgg16zelg6ya/new_sheet.tar.xz?dl=0>
Decompress it and save it in the folder :file: `app/data/genetics/`

Finally, start the Flask app (the default port will be 5000).

.. code-block:: bash

    export FLASK_APP=./ssam-lite-server/flask/run.py
    flask run


.. note::

   The port and further settings can be made in the *run.py* file or when starting the app with
   ``flask run``. For further information we would refer the reader to the 
   `Flask documentation <https://flask.palletsprojects.com/>`__.