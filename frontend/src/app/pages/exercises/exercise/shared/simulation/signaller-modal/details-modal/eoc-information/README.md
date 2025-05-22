# EOC Information

TODO: It would be better if the EOC could sent radiograms for requested information, too. However, radiograms must have a SimulatedRegion they're sent by and refactoring this would have been too much work at least for now. Therefore, information requested from the EOC will be shown in the details modal instead.

This folder contains the components to display the information. They're using `selectStateSnapshot` on purpose, since they should not do live-updates.
