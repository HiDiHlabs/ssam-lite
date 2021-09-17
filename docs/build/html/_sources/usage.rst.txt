####################
Usage
####################

Open SSAM-lite
==============

SSAM-lite will be opened (and executed) in your Web Browser. For a list of compatible Browsers
read :ref:`supported-browsers`. Connecting to SSAM-lite depends on whether you want to use the
*solo* or *server* version. However, the usage afterwards will be (almost) identical.

SSAM-lite-solo
--------------

SSAM-lite-solo runs locally on your computer. It is executed by your Browser
and to open it you onyl need to navigate to the unzipped SSAM-lite directory
and double-click the *index.html* to open it in your default Web Browser.

SSAM-lite-server
----------------

To connect to SSAM-lite-server, you will need to to open your favourite Web Browser (not IE)
and enter the correct IP address and port in the form {ip}:{port} (e.g. 127.0.0.1:5000).
However, the IP and port depends on your local setup. Talk to your responsible SSAM-lite coordinator.

Navigation
===========

Navigation is straight-forward. You can either scroll up and down to switch between the different steps
or you can use the navigation bar in the top of the window to directly jump to any section.

Furthermore, the "Get going!" button will bring you to the data center to start the analysis
by uploading your data.


Data
===========

The Data will be uploaded in the **Data Center** section of the tool. By clicking the "Coordinates" 
or "Signatures" button and selecting the correct files.
To be able to use SSAM-lite you need to prepare your data in csv format.
Two input files are required and must be structured as follows:

mRNA Coordinates
    This file needs to be of the form Gene, x-coordinate, y-coordinate.
    The name of the headers are irrelevant, however their order needs to be kept.
    Negative coordinates are possible and the units do not matter. However, their magnitude 
    might have an influence on proper parameter values later on.

    +----------+-----------+-----------+
    | Gene     |   x       |   y       |
    +----------+-----------+-----------+
    | Gene A   |   0.5     |   1.3     |
    +----------+-----------+-----------+
    | Gene A   |   1.1     |   2.1     |
    +----------+-----------+-----------+
    | Gene B   |   0.4     |   0.5     |
    +----------+-----------+-----------+

Gene Signatures
    This file should be a matrix of Cell types by Genes. 
    The first column and row contains the names of Cell types and Genes, respectively. All the other cell values
    are gene scores ... TODO  how to define this ...
    This will later be used to assign each pixel to a cell type (or leave them unclassified)
    based on the Kernel Density Estimation.

    +--------------+----------+-----------+-----------+
    |              | Gene A   | Gene B    | Gene C    |
    +--------------+----------+-----------+-----------+
    | Celltype A   |    0.5   |   -0.5    |   1.3     |
    +--------------+----------+-----------+-----------+
    | Celltype B   |    -0.2  |   1.1     |   2.1     |
    +--------------+----------+-----------+-----------+
    | Celltype C   |    0.3   |   0.4     |   0.5     |
    +--------------+----------+-----------+-----------+


.. note::
    The name of the genes sre not relevant as there is no database used in the background.
    But remember that the gene names from the coordinates and the signatures need to be the same
    (or at least the two sets of names must be at least partially overlapping).

Once both files are loaded you can proceed with setting the parameters for your analysis.

Parameters
===========

For a deep understanding of the SSAM framework we would refer the user to the
`SSAM publication <https://www.nature.com/articles/s41467-021-23807-4>`__,
however we will briefly describe the purpose and effect of the parameters
that can be set by the user to obtain optimal results.

Vector field width
    The vector field width defines the horizontal pixel count of the output images.
    This is necessary as the KDE will be projected onto discrete locations (the pixels).

    A higher value will result in higher resolution but also in increased processing time and memory
    as well as size of the output images.

KDE kernel bandwidth (sigma)
    The kernel bandwidth TODO definition?

    A higher value will result in an increased smoothing of the mRNA density estimation.

Cell assignment threshold
    This threshold is used to decide whether a pixel in the KDE projection belongs to
    a cell or not. It is visualised in the parameter preview to help find an 
    optimal value.


Each of the parameters can be set in their respective field and applied by hitting Enter.
For a more intuitive parameter selection you can open a preview by clicking "Use preview generator for parameter search".
This will display the results of a subset of your data with the currently set parameters and lets you 
interactively explore and tune your parameter set.

.. image:: ../res/imgs/ParameterPreview.png
  :width: 800
  :alt: Screenshot of the Parameter preview section

Once you are happy with your choice you can proceed with the actual analysis.


Analysis
========

To run the analysis, you start by clicking "Run Kernel Density Estimation" below
"Step 1: Kernel Density Estimation" and wait until processing is finished.
Once it finished, the KDE estimates will be displayed in a plot (see example below).
This step is the computationally most expensive and might tak a few minutes.

.. note::
    If you are using SSAM-lite-solo your Browser might warn you that it is being slowed down by the current site.
    This is normal due to the heavy computation running in the background and can be ignored.

.. image:: ../res/imgs/KDE.png
  :width: 800
  :alt: KDE estimation given the previously set parameters

Next, given the KDE estimates you can start inferring cell types.
Scroll down to "Step 2: Cell Assignments" and click on "Infer Cell Types".
The inferred cell types will be displayed in a new plot.

.. image:: ../res/imgs/inferredCelltypes.png
  :width: 800
  :alt: Cell types inferred from KDE using the provided gene signatures

If you are not content with the results you can go back to the parameters section
and refine those before rerunning the analysis.


Save results
================

All plots are produced with `Plotly <https://plotly.com/>`__ and can be downloaded
by hovering over the plot which triggers a legend to appear in the upper right corner,
now click the Camera icon which lets you download the current plot as png file.
