#About

This is a visualization tool I threw together to help myself figure out why the Cooley-Tukey fast fourier transform algorithm works.  It allows a user to see how modifying values in the frequency domain effect the signal domain (which is two-dimensional in this implementation, allowing for asymmetry in the frequency domain).

It can be played with [here](http://adeshar00.github.io/FourierVisualization).


#How to Use

Frequencies can be modified by dragging the red hands in the middle of the screen: when dragged, arrows will appear at each signal node to indicate the effect the change in frequency has on each part of the signal.

The band across the top of the canvas has a bunch of buttons which can be used to hide or show the hands for different frequencies (so you don't have to deal with a ton of hands cluttering up the screen).
